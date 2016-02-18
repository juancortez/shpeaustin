// module.exports exposes functions that we want to use in a different file
//module.exports = function(app, con){
module.exports = function(app) {
    var bodyParser = require('body-parser');
    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
        extended: true
    }));

    /*************************************************************************/
    // The following endpoints serve HTML pages
    /*************************************************************************/
    app.get('/', function(req, res) {
        res.render('index.html');
    });

    app.get('/about', function(req, res) {
        res.render('about.html');
    });

    app.get('/officers', function(req, res) {
        var officerList = require('../models/globals.js').officerList;
        var executiveOfficerList = require('../models/globals.js').executiveOfficerList;

        res.render('officers.ejs', {
            executiveOfficerList: executiveOfficerList,
            officerList: officerList
        });
    });

    app.get('/contact', function(req, res) {
        res.render('contact.html');
    });

    app.get('/membership', function(req, res) {
        res.render('membership.html');
    });

    app.get('/calendar', function(req, res){
        // Get access to the Google Calendar
        var google_calendar;
        var google_content;
        try{
            google_calendar = require('../google_service/google_calendar');
            google_content = require('../private_credentials/client_secret.json');
        } catch(err){
            console.error("Failed to loaded google calendar files...");
            res.sendStatus(404);
        }
        google_calendar.authorize(google_content, google_calendar.listEvents, res);
    });


    app.post('/contact', function(req, res) {
        if (process.env.VCAP_SERVICES) {
            var env = JSON.parse(process.env.VCAP_SERVICES);
            var credentials = env['sendgrid'][0].credentials;
        } else {
            try {
                data = require("../private_credentials/send_grid.json");
                
            } catch (ignore) {
                console.error("Failed to load data from send_grid.json");
                res.sendStatus(404);
            }
            var credentials = data.sendgrid[0].credentials;
        };

        //sendgrid documentation and attaching to bluemix: https://github.com/sendgrid/reseller-docs/tree/master/IBM
        var sendgrid  = require('sendgrid')(credentials.username, credentials.password);
        sendgrid.send({
          to:       'cortezjuanjr@gmail.com',
          from:     req.body.email,
          subject:  'SHPE Austin Website Message',
          text:     "Name: " + req.body.name + " Phone Number: " + req.body.phone + " E-mail Address: " + req.body.email +
            " Subject: " + req.body.category + " Message: " + req.body.message,
          html: " <b>Name:</b> " + req.body.name + "<br> <b>Phone number:</b> " + req.body.phone + "<br><b>E-mail address:</b> " + req.body.email +
             "<br><b> Category:</b> " + req.body.category + "<br><b>Message:</b> " + req.body.message
        }, function(err, json) {
          if (err) { return console.error(err); }
          console.log(json);
        });
        res.render('contact.html');
    });


    // sends front end the metadata/calendar_data.json file in application/json format
    app.get('/calendardata', function(req, res) {
        try {
            data = require("../metadata/calendar_data.json");
            
        } catch (ignore) {
            console.error("Failed to load data from calendar_data.json");
            res.sendStatus(404);
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });


    // sends front end the metadata/newsletter_data.json file in application/json format
    app.get('/newsletterdata', function(req, res) {
        try {
            data = require("../metadata/newsletter_data.json");
            
        } catch (ignore) {
            console.error("Failed to load data from newsletter_data.json");
            res.sendStatus(404);
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });

    // Load data from the newsletter contained in views/newsletters
    app.get('/newsletterload', function(req, res) {
        res.render('newsletter_load.html');
    });

    // opens up the views/newsletters/newsletter.html page and sends it to the /newsletterload endpoint
    app.get('/views/newsletters/newsletters.html', function(req, res) {
        var path = require('path');
        res.sendFile(path.resolve('views/newsletters/newsletters.html'));
    });

    // gets called from the /newsletterload endpoint and updates the /metadata/newsletter_data.json file
    app.post('/newsletterdata', function(req, res) {
        var jsonfile = require('jsonfile');
        jsonfile.spaces = 4;
        var path = require("path");
        var request = require('request');
        var fs = require("fs");
        var content = req.body.newsletter;
        var numItems = content.length;
        for(var i = 0; i < numItems; i++){
            var download = function(uri, filename, callback){
                request.head(uri, function(err, res, body){
                    //console.log('content-type:', res.headers['content-type']);
                    //console.log('content-length:', res.headers['content-length']);
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                });
             };
                download(content[i].image, 'newsletter'+i, function(){
                //console.log('done'); 
                // from root folder $mv newsletter* public/assets/newsletter
            });
        }

        var file = path.join(__dirname, '../metadata', 'newsletter_data.json');
        jsonfile.writeFile(file, req.body, function(err) {
            console.error(err);
        });
        console.log("Successfully created the newsletter_data.json file under the metadata folder.");
        res.sendStatus(200);
    });

    /*************************************************************************/
    // If endpoint does not exist, render an error
    /*************************************************************************/

    app.get('*', function(req, res) {
        res.render('404.html');
        //res.status(400).send({ error: 'HTML Error 404: Not Found!' });
    });


} // end of module exports


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
