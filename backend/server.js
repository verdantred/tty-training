'use strict';

const express = require('express');
const mongoose = require('mongoose');

var tagSchema = new mongoose.Schema({
    name: String,
	country: String
});
var entrySchema = new mongoose.Schema({}, {collection: 'orders'});
var Tag = mongoose.model('Tag', tagSchema);
var Entry = mongoose.model('Entry', entrySchema);
var test = new Tag({ name: '#test', country: 'testonia' });

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
	var dbUrl = 'mongodb://172.17.0.1:93/ordersDB';
	mongoose.connect(dbUrl);
	var con = mongoose.connection;
	
	con.on('error', function(err){
		console.log('No connection to database: ' + err);
	});
	con.once('open', function() {
		console.log('We are connected!');
		
		myfind(con, 'orders', {}, function(err, entries){
			if (err) res.status(501).send('Databse query error: ' + err);
			console.log("Found entries: " + entries);
			data.entries = entries;
			Tag.findOne({name: '#testi'}, function(err, tag){
				if (err) res.status(501).send('Databse query error: ' + err);
				if(tag == null){
					console.log("No test tag found: " + tag);
					test.save(function(err, test){
						if (err) res.status(502).send('Databse insert error: ' + err + ' ' + test);
					});
				}
				else {
					console.log('Test tag is already in the database');
				}
				Tag.find(function (err, tags) {
					if (err) res.status(501).send('Databse query error: ' + err);
					console.log("Found tags: " + tags);
					data.tags = tags;
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