var chalk = require('chalk');

console.log("Hey, it's a me error streamer!");
var streamError = function(err) {
  console.log(chalk.red(err));
};

module.exports = streamError;