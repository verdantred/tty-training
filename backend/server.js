'use strict';

const mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
    url: String,
	likes: Integer,
	tweet_count: Integer
});
var Video = mongoose.model('Video', videoSchema);

// Constants
const PORT = 8082;

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
	con.on('open', function() {
		console.log('We are connected!');
		Video.find({}).limit(10).sort({tweet_count: -1}).exec(function(err, results){
			if (err) console.log('Databse query error: ' + err);
			console.log("Found videos: " + results);
			mongoose.disconnect();
			res.send(results);
		});
	});
	
});

app.get('/close/', function (req, res) {
	stop = true;
	mongoose.disconnect();
	res.send('ok');
});

app.listen(PORT);
console.log('Running on http://192.168.99.100:' + PORT);
