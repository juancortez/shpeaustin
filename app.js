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


// Connect Redis
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

// var Db = require('tingodb')().Db,
//     assert = require('assert');

// var db = new Db(__dirname+'/database', {});
// // Fetch a collection to insert document into
// var collection = db.collection("data");
// // Insert a single document
// collection.insert(
// 	[
// 		{hello:'world_safe1'},
// 		{hello:'world_safe2'}
// 	], {w:1}, function(err, result) {
  
//   	assert.equal(null, err);

//   // Fetch the document
//   collection.findOne({hello:'world_safe2'}, function(err, item) {
//     assert.equal(null, err);
//     assert.equal('world_safe2', item.hello);
//     console.log(item.hello);
//   })
// });
//var mysql = require("mysql");

// // First you need to create a connection to the db
// var con = mysql.createConnection({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "root",
//   database: "sitepoint"
// });


// http://www.sitepoint.com/using-node-mysql-javascript-client/
// con.connect(function(err){
//   if(err){
//    //console.log('Error connecting to Db');
//     return;
//   }
//   //console.log('Connection established');
// });


// var employee = { name: 'Winnie', location: 'Australia' };
// con.query('INSERT INTO employees SET ?', employee, function(err,res){
//   if(err) throw err;
//   console.log('Last insert ID:', res.insertId);
// });

// con.query(
//   'UPDATE employees SET location = ? Where ID = ?',
//   ["South Africa", 5],
//   function (err, result) {
//     if (err) throw err;

//     console.log('Changed ' + result.changedRows + ' rows');
//   }
// );

// con.query(
//   'DELETE FROM employees WHERE id = ?',
//   [5],
//   function (err, result) {
//     if (err) throw err;

//     console.log('Deleted ' + result.affectedRows + ' rows');
//   }
// );

// con.query('SELECT * FROM employees',function(err,rows){
//   if(err) throw err;

//   console.log('Data received from Db:\n');
//   console.log(rows);

// });

// con.end(function(err) {
// The connection is terminated gracefully
// Ensures all previously enqueued queries are still
// before sending a COM_QUIT packet to the MySQL server.
// });