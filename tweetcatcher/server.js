var Twitter = require('twitter');
require('dotenv').load();

var streamFilter = require('./streams/filters');
var streamError = require('./streams/error');

var streamParameters = {
  track: "youtube"
};
console.log(process.env.consumer_key);
console.log(process.env.consumer_secret);
console.log(process.env.access_token_key);
console.log(process.env.access_token_secret);

var client = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

console.log("Hey, I got here!");

client.stream('statuses/filter', streamParameters, function (stream) {
  stream.on('data', streamFilter);
  stream.on('error', streamError);
});
