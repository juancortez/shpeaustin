var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	fs = require('fs'),
    request = require('request'),
    favicon = require('serve-favicon'),
    redis = require('redis'),
    redisCredentials,
    router = express.Router(),
    compression = require('compression'),
    redisCredentials = require('./private_credentials/redis.json'),
    redisCredentials = redisCredentials.rediscloud[0].credentials,
    redis_connect = require("./redis/redis.js");


// Connect to Redis Database
var client = redis.createClient(redisCredentials.port, redisCredentials.hostname, {no_ready_check: true});
client.auth(redisCredentials.password, function (err) {
    if (err){
    	console.error(err);
    }
});

app.use(compression()); //use compression 
app.use(express.static(__dirname + '/public')); // declare a static directory
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(favicon(__dirname + '/public/assets/shpe_austin_icon.png'));
require('./router/main')(app, client); // adds the main.js file to send response to browser
app.set('views', __dirname + '/views'); // defines where our HTML files are placed
app.set('view engine', 'ejs'); // used for HTML rendering
app.engine('html', require('ejs').__express); // rendering HTML files through EJS


// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
    console.log("Server starting on " + appEnv.url);
});

client.on('connect', function() {
    redis_connect.onRedisConnection(client, redis);
});