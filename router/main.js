// module.exports exposes functions that we want to use in a different file
//module.exports = function(app, con){
module.exports = function(app, client, privateCredentials) {

    var revision; // global variable within the module. used as a "hack" for officers.ejs
    /*************************************************************************/
    // The following endpoints serve HTML pages
    /*************************************************************************/
    app.get('/', function(req, res) {
        client.get('revisionNumber', function (err, revisionNumber) {
            if (revisionNumber) {
                revision = revisionNumber;
                res.render('index.html', {
                    revision: revisionNumber
                });
            } else{
                res.render('index.html', {
                    revision: 0 // just in case the database doesn't fetch the right revision
                });
            }
        });
    });

    app.get('/about', function(req, res) {
        client.get('revisionNumber', function (err, revisionNumber) {
            if (revisionNumber) {
                revision = revisionNumber;
                res.render('about.html', {
                    revision: revisionNumber
                });
            } else{
                res.render('about.html', {
                    revision: 0 // just in case the database doesn't fetch the right revision
                });
            }
        });
    });

    app.get('/officers', function(req, res) {
        // TODO: I am not sure how to retrieve 2 keys from client without affecting performance
        client.get('officerList', function (err, officerList) {
            if (officerList) {
                if(typeof revision === 'string'){
                    res.render('officers.ejs', {
                        officerList: JSON.parse(officerList),
                        revision: revision
                    });
                } else{
                    // default revision of 0
                    res.render('officers.ejs', {
                        officerList: JSON.parse(officerList),
                        revision: 0 
                    });
                }
            } else{
                console.error(err);
                res.sendStatus(404);
            }
        });
    });

    
    app.get('/membership', function(req, res) {
        client.get('revisionNumber', function (err, revisionNumber) {
            if (revisionNumber) {
                revision = revisionNumber;
                res.render('membership.html', {
                    revision: revisionNumber
                });
            } else{
                res.render('membership.html', {
                    revision: 0 // just in case the database doesn't fetch the right revision
                });
            }
        });
    });

    app.get('/contact', function(req, res) {
        client.get('revisionNumber', function (err, revisionNumber) {
            if (revisionNumber) {
                revision = revisionNumber;
                res.render('contact.html', {
                    revision: revisionNumber
                });
            } else{
                res.render('contact.html', {
                    revision: 0 // just in case the database doesn't fetch the right revision
                });
            }
        });
    });

    app.get('/meeting', function(req, res){
        res.render('meeting.html', {
            revision: 0 
        });
    });

    app.get('/officermeeting', function(req, res){
        res.render('officer_meeting.html', {
            revision: 0 
        });
    })

    app.get('/calendar', function(req, res){
        // Get access to the Google Calendar
        var google_calendar;
        var google_content = privateCredentials.google_api;
        try{
            google_calendar = require('../google_service/google_calendar');
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
            var credentials = privateCredentials.sendgrid.credentials;
        }

        //sendgrid documentation and attaching to bluemix: https://github.com/sendgrid/reseller-docs/tree/master/IBM
        var sendgrid  = require('sendgrid')(credentials.username, credentials.password);
        var sendGridEmail = require('../models/globals.js').sendGridEmail; // set flag to true to clear database
        sendgrid.send({
          to:       sendGridEmail,
          from:     req.body.email,
          subject:  'SHPE Austin Website Message',
          text:     "Name: " + req.body.name + " Phone Number: " + req.body.phone + " E-mail Address: " + req.body.email +
            " Subject: " + req.body.category + " Message: " + req.body.message,
          html: " <b>Name:</b> " + req.body.name + "<br> <b>Phone number:</b> " + req.body.phone + "<br><b>E-mail address:</b> " + req.body.email +
             "<br><b> Category:</b> " + req.body.category + "<br><b>Message:</b> " + req.body.message
        }, function(err, json) {
            if (err) { 
                console.error(err); 
                res.sendStatus(400);
            }
          res.sendStatus(200);
          console.log("E-mail sent successfully. " + JSON.stringify(json) + " \nSent to: " + sendGridEmail);
        });
    });


    // sends front end the metadata/calendar_data.json file in application/json format
    app.get('/calendardata', function(req, res) {
        client.get('calendarData', function (err, calendarData) {
            if (calendarData) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(calendarData);
            } else{
                res.sendStatus(404);
                console.error(err);
            }
        });
    });


    // sends front end the metadata/newsletter_data.json file in application/json format
    app.get('/newsletterdata', function(req, res) {
        client.get('newsletterdata', function (err, newsletterdata) {
            if (newsletterdata) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.parse(newsletterdata));
            } else{
                res.sendStatus(404);
                console.error(err);
            }
        });
    });

    // Load data from the newsletter contained in views/newsletters
    app.get('/newsletterload', function(req, res) {
        res.render('newsletter_load.html', {
            revision: 0 
        });
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
        res.render('404.html', {
            revision: 0 
        });
        //res.status(400).send({ error: 'HTML Error 404: Not Found!' });
    });

} // end of module exports