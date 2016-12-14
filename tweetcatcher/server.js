var Twitter = require('twitter');
require('dotenv').load();

var streamFilter = require('./streams/filters');
var streamError = require('./streams/error');

var streamParameters = {
  track: "youtube"
};

var client = new Twitter({
  consumer_key: consumer_key,
  consumer_secret: consumer_secret,
  access_token_key: access_token_key,
  access_token_secret: access_token_secret
});

console.log("Hey, I got here!");

client.stream('statuses/filter', streamParameters, function (stream) {
  stream.on('data', streamFilter);
  stream.on('error', streamError);
});
