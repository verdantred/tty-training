'use strict';

const mongoose = require('mongoose');
var AsyncPolling = require('async-polling');
var async = require('async');
require('dotenv').load();
var request = require('request');

const ytUrl = "https://www.googleapis.com/youtube/v3/videos?part=statistics&key=" + process.env.api_key + "&id=";

// Use bluebird promises
mongoose.Promise = require('bluebird');

var videoSchema = new mongoose.Schema({
    url: String,
	vid: String,
	likes: {type: Number, default: null},
	tweet_count: {type: Number, default: 0}
});
var Video = mongoose.model('Video', videoSchema);

var polling = AsyncPolling(pollerFunction, 3000);

console.log('Running refiner!');
var dbUrl = 'mongodb://172.17.0.1:93/tweets';
mongoose.connect(dbUrl);
var con = mongoose.connection;

con.on('error', function(err){
	console.log('No connection to database: ' + err);
});
con.once('open', function() {
	console.log('We are connected!');
	mongoose.model('Message', new mongoose.Schema({ message: String, url: String, vid: String, tweet_count: Number, processed: Boolean}), 'messages');
	polling.run(); // Let's start polling.
});

function pollerFunction(end) {
	var Message = con.model('Message');
	Message.find({}, function(err, entries){
		if (err) {
			end(err);
			return;
		}
		console.log("Found raw entries: " + entries.length);
		
		// 1st parameter is the array of items we are working on
		async.forEach(entries, 
			//2nd parameter is the function that processes each item
			function(element, callback){
				console.log("Processing element: " + element);
				var promise = Video.findOneAndUpdate({url: element.url}, { $inc: { tweet_count: 1 }}).exec();
				promise.then(function(vid){
					var waitFor;
					if(!vid){
						console.log("Didn't find the video, inserting it..");
						waitFor = new Video({url: element.url, vid: element.vid, tweet_count: element.tweet_count}).save(function(err, vid){
						});
					}
					else{
						waitFor = Promise.resolve();
					}
					return waitFor;
				})
				.then(function(video){
					console.log("Inserted/updated the video: " + video);
					element.processed = true;
					element.save(function(err, updated){
						callback();
					});
				})
				.catch(function(err){
					callback(err);
				});
			},
			//3rd parameter is function that will be called when every item is processed
			function(err){
				if (err) {
					end(err);
					return;
				}
				console.log("Processed all the elements, removing tweets.");
				Message.find({processed: true}).remove().exec(function(err, removed){
					if (err) {
						end(err);
						return;
					}
					console.log("Removed " + removed + " old item(s)! Gathering top10.");
					
					Video.find({}).limit().sort({tweet_count: -1}).exec(function(err, results){
						if (err) {
							end(err);
							return;
						}
						console.log("Found " + results.length + " videos!");
						var idList = "";
						var dict = {};
						var i = 0;
						for(var j = 0; i < 10 && j < results.length; ++j){
							if(results[j].likes == null){
								i++;
								idList = idList + results[j].vid + ',';
								dict[results[j].vid] = results[j];
							}
						}
						idList = idList.slice(0, -1);
						console.log("Id list is: " + idList);
						request(ytUrl + idList, function(error, response, body){
							if (err) {
								end(err);
								return;
							}
							console.log("Body of the response got!");
							if(body && body.items > 0){
								async.forEach(body.items,
									function(res, cb){
										dict[res.id].likes = res.statistics.likeCount;
										cb();
									},
									function(error){
										if (err) {
											end(err);
											return;
										}
										async.parallel(Object.keys(dict).map(key => dict[key].save), function(err, saved){
											if (err) {
												end(err);
												return;
											}
											console.log("Fetched like counts to the videos! Count: ", saved.length)
											if(results.length > 500){
												Video.find({}).sort({tweet_count: 1}).limit(results.length - 500).remove().exec(function(err, rems){
													if (err) {
														end(err);
														return;
													}
													console.log("Removed " + rems.length + " not-liked items.")
													end(null, results);
												});
											}
											else {
												end(null, results);
											}
										});
									}
								);
							}
							else{
								end("Error in youtube API response!");
								return;
							}
						});
						
					});
				});
			}
		);
		
	});

}

polling.on('error', function (error) {
    console.log("Encountered an erronous error: ", error);
});
polling.on('result', function (result) {
    console.log("Nice job!");
});
