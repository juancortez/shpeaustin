var express = require('express');
var app = express();
var mysql = require("mysql");

// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "sitepoint"
});

app.use(express.static(__dirname + '/public')); // declare a static directory
require('./router/main')(app, con); // adds the main.js file to send response to browser
app.set('views', __dirname + '/views'); // defines where our HTML files are placed
app.set('view engine', 'ejs'); // used for HTML rendering
app.engine('html', require('ejs').renderFile); // rendering HTML files through EJS

var server = app.listen(8000, function(){
	console.log("We have started our server on port 8000");
});



// http://www.sitepoint.com/using-node-mysql-javascript-client/
con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

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





