'use strict';

const mongoose = require('mongoose');
var AsyncPolling = require('async-polling');
var async = require('async');

// Use bluebird promises
mongoose.Promise = require('bluebird');

var videoSchema = new mongoose.Schema({
    url: String,
	likes: {type: Number, default: 0},
	tweet_count: {type: Number, default: 0}
});
var Video = mongoose.model('Video', videoSchema);

var Messages = mongoose.model('Message', 
               new Schema({ message: String, url: String, tweet_count: Number, processed: Boolean}), 
               'messages');

function myFind (con, collec, query, callback) {
    con.db.collection(collec, function (err, collection) {
		if(err) {
			console.log('Collection not found: ' + err);
			return;
		}
		collection.find(query).toArray(callback);
    });
}

function myRemove (con, collec, query, callback) {
    con.db.collection(collec, function (err, collection) {
		if(err) {
			console.log('Collection not found: ' + err);
			return;
		}
		collection.find(query).remove().exec(callback);
    });
}

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
	polling.run(); // Let's start polling.
});

function pollerFunction(end) {
	
	var Message = mongoose.model('Message', new mongoose.Schema({ message: String, url: String, tweet_count: Number, processed: Boolean}), 'messages');
	myFind(con, 'messages', {}, function(err, entries){
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
				element.processed = true;
				var promise = Video.findOneAndUpdate({url: element.url}, { $inc: { tweet_count: 1 }}).exec();
				promise.then(function(vid){
					var waitFor;
					if(!vid){
						console.log("Didn't find the video, inserting it..");
						waitFor = new Video({url: element.url, likes: 0, tweet_count: element.tweet_count}).save(function(err, vid){
						});
					}
					else{
						waitFor = Promise.resolve();
					}
					return waitFor;
				})
				.then(function(video){
					console.log("Inserted/updated the video: " + video);
					callback();
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
				myRemove(con, 'messages',{processed: true}, function(err, removed){
					if (err) {
						end(err);
						return;
					}
					console.log("Removed " + removed + " old item(s)! Gathering top10.");
					
					Video.find({}).limit(10).sort({tweet_count: -1}).exec(function(err, results){
						if (err) {
							end(err);
							return;
						}
						end(null, results);
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
    console.log("Found videos: " + result);
});

