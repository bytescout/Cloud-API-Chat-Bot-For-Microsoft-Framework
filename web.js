var packageInfo = require('./package.json');


var restify = require('restify');

module.exports = function (bot) {
	var server = restify.createServer();
	server.post('/v1/messages', bot.verifyBotFramework(), bot.listen());

	server.get('/', function (req, res) {
	  res.json({ version: packageInfo.version });
	});

	var port = process.env.PORT || 8080;
	server.listen(port, function () {
	    console.log('%s listening to %s', server.name, server.url); 
	});
};