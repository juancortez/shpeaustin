// module.exports exposes functions that we want to use in a different file
module.exports = function(app, con){

	/*************************************************************************/
	// The following endpoints serve HTML pages
	/*************************************************************************/
	app.get('/', function(req, res){ 
		res.render('index.html');
	});

	app.get('/about', function(req, res){
		res.render('about.html');
	});

	app.get('/contact', function(req, res){
		res.render('contact.html');
	});

	app.get('/classes', function(req, res){
		var classes = [
				{ abbr: 'EE302', name: "Introduction to Electrical Engineering" },
				{ abbr: 'EE411', name: "Circuit Theory" },
				{ abbr: 'EE461L', name: "Software Design & Implementation II" },
				{ abbr: 'EE360', name: "Juanito"}
		];
		var tagline = "Tagline.";

		res.render('classes.ejs', {
			classes: classes,
			tagline: tagline
		});
	});

	/*************************************************************************/
	// The following endpoints make calls to the database and return data to the
	// front end
	/*************************************************************************/

	app.get('/employees', function(req, res){
		con.query('SELECT * FROM employees',function(err,rows){
		  if(err) throw err;
		  console.log('Data received from Db:\n');
		  console.log(rows);
		  res.send(rows); 
		});
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


	/*************************************************************************/
	// If endpoint does not exist, render an error
	/*************************************************************************/

	app.get('*', function(req, res){
  		res.status(400).send({ error: 'HTML Error 404: Not Found!' });
	});


}
