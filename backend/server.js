'use strict';

const express = require('express');
const mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
    url: String,
	likes: Integer
});
var Video = mongoose.model('Video', videoSchema);
var test = new Video({ url: 'youtube.com/watch?v_test', likes: 1 });

// Constants
const PORT = 8082;

function myfind (con, collec, query, callback) {
    con.db.collection(collec, function (err, collection) {
		if(err) res.status(501).send('Collection not found: ' + err);
		collection.find(query).toArray(callback);
    });
}

// App
const app = express();
app.get('/', function (req, res) {
	var data = {};
	var dbUrl = 'mongodb://172.17.0.1:93/tweets';
	mongoose.connect(dbUrl);
	var con = mongoose.connection;
	
	con.on('error', function(err){
		console.log('No connection to database: ' + err);
	});
	con.once('open', function() {
		console.log('We are connected!');
		
		myfind(con, 'messages', {}, function(err, entries){
			if (err) res.status(501).send('Databse query error: ' + err);
			console.log("Found raw entries: " + entries);
			data.raws = entries;
			Video.findOne({url: 'youtube.com/watch?v_test'}, function(err, vid){
				if (err) res.status(501).send('Databse query error: ' + err);
				if(vid == null){
					console.log("No test vid found: " + vid);
					test.save(function(err, test){
						if (err) res.status(502).send('Databse insert error: ' + err + ' ' + test);
					});
				}
				else {
					console.log('Test tag is already in the database');
				}
				Video.find(function (err, vids) {
					if (err) res.status(501).send('Databse query error: ' + err);
					console.log("Found videos: " + vids);
					data.vids = vids;
					mongoose.disconnect();
					res.send(data);
				});
			});
			
		});
	
	});
	
});

app.get('/close/', function (req, res) {
	mongoose.disconnect();
	res.send('ok');
});

app.listen(PORT);
console.log('Running on http://192.168.99.100:' + PORT);