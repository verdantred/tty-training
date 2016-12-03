var chalk = require('chalk');
var request = require('request');
var re = /youtube.com\/watch?./i;

var streamFilter = function(tweet) {
	console.log(chalk.green(tweet.user.screen_name, ' : ' , tweet.text));
	matches = tweet.entities.urls[0].display_url.match(re);
	if(matches){
		var data = {message: tweet.text, url: matches[0]};
		
		request.post({url: '172.17.0.1:80/interface/',
							body: data, 
							headers: {'Content-Type': 'application/json'}}, 
							function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body);
			}
		});
	}
};

module.exports = streamFilter;