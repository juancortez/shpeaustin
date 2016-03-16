$( document ).ready(function() { // HTML has loaded

  $("#Juan").click(function(){
	$("#text").fadeToggle(1000, function(){
	  		$(this).css({ 'font-weight': 'bold', 'color' : 'green'});
	  	});
  	});

  $('#database').click(function(){
	   $.get('http://localhost:8000/employees', {}, function(data){
	        console.log("Data received: " + JSON.stringify(data));
			var columns = [ "ID", "Name", "Location"]
			createTable(data, columns);
	   });
	});


  // https://desandro.github.io/3dtransforms/docs/carousel.html
  $('#flip').click(function(){
  	$('#card').toggleClass('flipped');
  });

  function createTable(data, columns){
	var html = '<table><tbody>';
	html += '<thead>';
	for (var i = 0, len = columns.length; i < len; ++i) {
		html += '<td><b>' + columns[i] + '</b></td>';
	}
	html += "</thead>";
	for (var i = 0, len = data.length; i < len; ++i) {
	    html += '<tr>';
        html += '<td>' + data[i].id + '</td>';
        html += '<td>' + data[i].name + '</td>';
        html += '<td>' + data[i].location + '</td>';
	    html += "</tr>";
	}
	html += '</tbody><tfoot><tr></tr></tfoot></table>';
	$(html).appendTo('#div1');
  }

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



    /*************************************************************************/
    // The following endpoints make calls to the database and return data to the
    // front end
    /*************************************************************************/

    // app.get('/employees', function(req, res){
    // 	con.query('SELECT * FROM employees',function(err,rows){
    // 	  if(err) throw err;
    // 	  console.log('Data received from Db:\n');
    // 	  console.log(rows);
    // 	  res.send(rows); 
    // 	});
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
