// module.exports exposes functions that we want to use in a different file
//module.exports = function(app, con){
module.exports = function(app){
	var bodyParser = require('body-parser');
	var nodemailer = require('nodemailer');
	app.use(bodyParser.json());       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	    extended: true
	})); 

	/*************************************************************************/
	// The following endpoints serve HTML pages
	/*************************************************************************/
	app.get('/', function(req, res){ 
		res.render('index.html');
	});

	app.get('/about', function(req, res){
		res.render('about.html');
	});

	app.get('/officers', function(req, res){
		var officerList = require('../models/globals.js').officerList;
		var executiveOfficerList = require('../models/globals.js').executiveOfficerList;

		res.render('officers.ejs', {
			executiveOfficerList: executiveOfficerList,
			officerList: officerList
		});
	});

	app.get('/contact', function(req, res){
		res.render('contact.html');
	});

	app.get('/membership', function(req, res){
		res.render('membership.html');
	});

	app.post('/contact', function(req, res){
		// var smtpTransport = nodemailer.createTransport("SMTP",{
		//    service: "Gmail",
		//    auth: {
		//        user: 'cortezjuanjr@gmail.com',
	 //        	pass: '****'
		//    }
		// });

		var phoneNumber = req.body.phone.replace(/\D/g,'');

		// var mail = {
		//     from: req.body.email,
		//     to: "cortezjuanjr@gmail.com",
		//     subject: "SHPE Austin Website Message",
		//     html: "Message sent from <b>" + req.body.name + "</b> with phone number <b>" + phoneNumber + "</b> and email <b>" + req.body.email +
		//     "</b>. <b>Message:</b> " + req.body.message
		// }

		// smtpTransport.sendMail(mail, function(error, response){
		//     if(error){
		//         console.log(error);
		//     }else{
		//         console.log("Message sent: " + response.message);
		//     }

		//     smtpTransport.close();
		// });

	var sendmail = require('sendmail')();
 
	sendmail({
	    from: req.body.email,
	    to: "cortezjuanjr@gmail.com",
	    subject: "SHPE Austin Website Message",
	    content: "Message sent from " + req.body.name + " with phone number " + phoneNumber + " and email " + req.body.email +
		". Message: " + req.body.message,
	  }, function(err, reply) {
	    console.log(err && err.stack);
	    console.dir(reply);
	});
		res.render('index.html');
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

	app.get('/views/newsletters/newsletters.html', function(req, res){
		var path = require('path');
		res.sendFile(path.resolve('views/newsletters/newsletters.html'));
	});


	app.get('/newsletterdata', function(req,res){
		var path = require('path');
		var fs = require('fs');
		var file = path.join(__dirname, '../metadata', 'newsletter_data.json');
		var data;

		fs.readFile(file, 'utf8', function (err, data) {
		  if (err) throw err;
		  	data = JSON.parse(data);
		  	//console.log(data);
		});

		res.setHeader('Content-Type', 'application/json');
    	res.send(data);	
	});

	app.post('/newsletterdata', function(req, res){
		var jsonfile = require('jsonfile');
		var path = require("path");

		var file = path.join(__dirname, '../metadata', 'newsletter_data.json');
		jsonfile.writeFile(file, req.body, function (err) {
		  console.error(err);
		});

		res.sendStatus(200);
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
		res.render('404.html');
  		//res.status(400).send({ error: 'HTML Error 404: Not Found!' });
	});


}
