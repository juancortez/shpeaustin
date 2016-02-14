var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs'),
  request = require('request');
//var mysql = require("mysql");

// // First you need to create a connection to the db
// var con = mysql.createConnection({
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "root",
//   database: "sitepoint"
// });

app.use(express.static(__dirname + '/public')); // declare a static directory
//require('./router/main')(app, con); 
require('./router/main')(app); // adds the main.js file to send response to browser
app.set('views', __dirname + '/views'); // defines where our HTML files are placed
app.set('view engine', 'ejs'); // used for HTML rendering
app.engine('html', require('ejs').__express); // rendering HTML files through EJS

var officerList = require('./models/globals.js').officerList;
var executiveOfficerList = require('./models/globals.js').executiveOfficerList;

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// var server = app.listen(8000, function(){
// 	console.log("We have started our server on port 8000");
//   parseOfficerJSON();
// });


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
  parseOfficerJSON();
});


function parseOfficerJSON(){
  var Officer = require('./models/officers.js');

      var data = [];
      var file = "./metadata/officers.json"

      try {
          //console.log("Loading officer data from " + file);
          data = require(file);
          //console.log("Successfully loaded data from " + file);
      } catch (ignore) {
          console.error("Failed to load data from " + file);
      }

      //var executiveOfficerList = [];
      for(var i = 0; i < data.executive.length; i++){
        var current = data.executive[i];
        var officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url);
        executiveOfficerList.push(officer);
      }
      
      //var officerList = [];
      for(var i = 0; i < data.chairs.length; i++){
        var current = data.chairs[i];
        var officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url);
        officerList.push(officer);
      }
}

function parseNewsletter(){

  //   var download = function(uri, filename, callback){
  // request.head(uri, function(err, res, body){
  //   console.log('content-type:', res.headers['content-type']);
  //   console.log('content-length:', res.headers['content-length']);

  //     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  //   });
  // };

  // download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
  //   console.log('done');
  // });
}

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





