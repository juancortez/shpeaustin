var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs'),
    request = require('request');
var favicon = require('serve-favicon');


app.use(express.static(__dirname + '/public')); // declare a static directory
app.use(favicon(__dirname + '/public/assets/shpe_austin_icon.png'));
//require('./router/main')(app, con); 
require('./router/main')(app); // adds the main.js file to send response to browser
app.set('views', __dirname + '/views'); // defines where our HTML files are placed
app.set('view engine', 'ejs'); // used for HTML rendering
app.engine('html', require('ejs').__express); // rendering HTML files through EJS


// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

try{
    util = require('./utils/utils.js');
    util.parseOfficerJSON();
} catch(e){
    console.error("Did not find utils.js");
}


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

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
    console.log("Server starting on " + appEnv.url);
});



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