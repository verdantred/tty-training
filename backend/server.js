'use strict';

const mongoose = require('mongoose');
const express = require('express');
var bodyParser = require('body-parser')

var videoSchema = new mongoose.Schema({
    url: String,
	likes: Number,
	tweet_count: Number
});
var Video = mongoose.model('Video', videoSchema);

// Constants
const PORT = 8082;

const app = express();
app.use(bodyParser.json());

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

app.post('/tweets', function (req, res) {
	var data = {};
	var query = {};
	var sort_query = {tweet_count: -1};
	console.log(req.body);
	var message;
	if(req.body.message && req.body.message.indexOf(" ") != -1){
		message = req.body.message.split(' ');
	}
	else{
		message = [req.body.message, ""];
	}

	if(message[0] == "likes" || message[1] == "likes") sort_query = {likes: 1};
	if(message[0] == "-likes" || message[1] == "-likes") sort_query = {likes: -1};
	if(message[0] == "like%" || message[1] == "like%") sort_query = {likeRate: 1};
	if(message[0] == "-like%" || message[1] == "-like%") sort_query = {likeRate: -1};
	if(message[0] == "tweets" || message[1] == "tweet") sort_query = {tweet_count: 1};
	if(message[0] == "-tweets" || message[1] == "-tweet") sort_query = {tweet_count: -1};
	if(message[0] == "hour" || message[1] == "hour") query = {date: { $gt: d.setHours(d.getHours() - 1) }};
	if(message[0] == "day" || message[1] == "day") query = {date: { $gt: d.setDate(d.getDate() - 1) }};
	if(message[0] == "week" || message[1] == "week") query = {date: { $gt: d.setDate(d.getDate() - 7) }};
	if(message[0] == "month" || message[1] == "month") query = {date: { $gt: d.setMonth(d.getMonth() - 1) }};
	
	Video.find(query).limit(10).sort(sort_query).exec(function(err, results){
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
