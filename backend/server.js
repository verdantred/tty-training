'use strict';

const mongoose = require('mongoose');
const express = require('express');

var videoSchema = new mongoose.Schema({
    url: String,
	likes: Number,
	tweet_count: Number
});
var Video = mongoose.model('Video', videoSchema);

// Constants
const PORT = 8082;

const app = express();

var dbUrl = 'mongodb://172.17.0.1:93/tweets';
mongoose.connect(dbUrl);
var con = mongoose.connection;

con.on('error', function(err){
	console.log('No connection to database: ' + err);
});
con.once('open', function() {
	console.log('We are connected!');
	console.log('Running on http://192.168.99.100:' + PORT);
	app.listen(PORT);
});

// App

app.get('/tweets', function (req, res) {
	var data = {};
	
	Video.find({}).limit(10).sort({tweet_count: -1}).exec(function(err, results){
		if (err) res.status(500).send('Databse query error: ' + err);
		console.log("Found videos: " + results);
		data.results = results;
		res.send(data);
	});
	
});

app.get('/close/', function (req, res) {
	mongoose.disconnect();
	res.send('ok');
});

app.get('/reconnect/', function (req, res) {
	mongoose.disconnect();
	mongoose.connect(dbUrl);
	var con = mongoose.connection;

	con.on('error', function(err){
		res.status(500).send('No connection to database: ' + err);
	});
	con.once('open', function() {
		console.log('We are connected!');
		console.log('Running on http://192.168.99.100:' + PORT);
		res.send('ok');
	});
});
