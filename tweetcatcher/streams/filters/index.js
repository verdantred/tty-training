var chalk = require('chalk');
var request = require('request');
var re = /youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/i;

console.log("Hey, it's a me streamer!");

var options = {
	url: 'http://172.17.0.1:80/interface/',
	method: 'POST',
	json: {}
};

var streamFilter = function(tweet) {
	if(tweet && tweet.user){
		console.log(chalk.yellow(tweet.user.screen_name, ' : ' , tweet.text));
		var matches = [];
		if(tweet.entities.urls.length > 0 && tweet.entities.urls[0].expanded_url){
			matches = tweet.entities.urls[0].expanded_url.match(re);
		}
		if(matches && matches.length > 0 && tweet.retweeted_status){
			console.log(chalk.green(tweet.text, ' : ', matches[0], ' : ', matches[1], ' : ', tweet.retweeted_status.retweet_count + 1));
			options.json = {message: tweet.text, retweet: tweet.retweeted_status.text, url: matches[0], vid: matches[1], tweet_count: tweet.retweeted_status.retweet_count + 1, processed: false, date: tweet.retweeted_status.created_at};
			request.post(options, function (error, response, body) {
				if(error) console.log(body + " " + error);
				if (!error && response.statusCode == 200) {
					console.log(body);
				}
			});
		}
	}
	
};

module.exports = streamFilter;