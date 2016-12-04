'use strict';

const mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
    url: String,
	likes: Number,
	tweet_count: Number
});
var Video = mongoose.model('Video', videoSchema);

function myfind (con, collec, query, callback) {
    con.db.collection(collec, function (err, collection) {
		if(err) res.status(501).send('Collection not found: ' + err);
		collection.find(query).toArray(callback);
    });
}

var dbUrl = 'mongodb://172.17.0.1:93/tweets';
mongoose.connect(dbUrl);
var con = mongoose.connection;

function doStuff() {
	
	con.on('error', function(err){
		console.log('No connection to database: ' + err);
	});
	con.once('open', function() {
		console.log('We are connected!');
		
		myfind(con, 'messages', {}, function(err, entries){
			if (err) console.log('Databse query error: ' + err);
			console.log("Found raw entries: " + entries.length);
			
			
			entries.forEach(function(element){
				Video.findOneAndUpdate({url: element.url}, 
												{$setOnInsert: {tweet_count: element.tweet_count}, $inc: {tweet_count: 1}}, 
												{upsert:true}, 
												function(err, vid){
					if (err) console.log('Databse query error: ' + err);
					element.remove(function (err, element) {
						if (err) console.log('Databse remove error: ' + err);
					});
				});
			});
			
			Video.find({}).limit(10).sort({tweet_count: -1}).exec(function(err, results){
				if (err) console.log('Databse query error: ' + err);
				console.log("Found videos: " + results);
				// Youtube API calls
			});
			
		});
	
	});
};

function run() {
  setInterval(doStuff, 3000);
};

console.log('Running refiner!');
run();
