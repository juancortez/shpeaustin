// module.exports exposes functions that we want to use in a different file
//module.exports = function(app, con){
module.exports = function(app, client, privateCredentials) {
    var uuid = require('node-uuid');
    var revision; // global variable within the module. used as a "hack" for officers.ejs
    var revisionNumber = require('../models/globals.js').revision; // global variable for revision number
    var url = require('url');
    /*************************************************************************/
    // The following endpoints serve HTML pages
    /*************************************************************************/
    app.get('/', function(req, res) {
        res.render('index.html', {
            revision: revisionNumber
        });
    });

    app.get('/about', function(req, res) {
        res.render('about.html', {
            revision: revisionNumber
        });
    });

    app.get('/officers', function(req, res) {
        client.get('officerList', function (err, officerList) {
            if(officerList){
                res.render('officers.ejs', {
                    officerList: JSON.parse(officerList),
                    revision: revisionNumber
                });
            } else{
                console.error(err);
                res.sendStatus(404);
            }
        });
    });

    
    app.get('/membership', function(req, res) {
        res.render('membership.html', {
            revision: revisionNumber
        });
    });

    app.get('/contact', function(req, res) {
        res.render('contact.html', {
            revision: revisionNumber
        });
    });

    /*************************************************************************/
    // The following endpoints enable WebRTC connection capabilities with appear.in
    /*************************************************************************/
    app.get('/meeting', function(req, res){
        res.render('meeting.html', {
            revision: revisionNumber 
        });
    });

    app.get('/officermeeting', function(req, res){
        res.render('officer_meeting.html', {
            revision: revisionNumber 
        });
    });

    /*************************************************************************/
    // The /login endpoint authenticates users
    /*************************************************************************/
    app.post('/login', function(req, res){
        // VERY basic authentication
        var credentials = privateCredentials.websiteLogin;
        if(req.body.username == credentials.username && req.body.password == credentials.password){
            console.log("Login successful");
            //store all users that have logged in
            client.get('id', function (err, redisId) {
                if(redisId){
                    // create JSON to send to front end
                    var uuidNumber = uuid.v4();
                    var id = {};
                    id['uuid'] = [];
                    id.uuid.push(uuidNumber);
                    // update the Redis database
                    var uuidRedis = JSON.parse(redisId);
                    uuidRedis.uuid.push(uuidNumber);
                    client.set('id', JSON.stringify(uuidRedis));
                    // send id JSON to front end
                    res.setHeader('Content-Type', 'application/json');
                    res.send(id);
                } else{
                    // create JSON to send to front end
                    var uuidNumber = uuid.v4();
                    var id = {};
                    id['uuid'] = [];
                    id.uuid.push(uuidNumber);
                    // create the 'id' key on the Redis database
                    client.set('id', JSON.stringify(id));
                    // send id JSON to front end
                    res.setHeader('Content-Type', 'application/json');
                    res.send(id);
                }
            });
        } else{
            console.log("Login unsuccessful");
            res.sendStatus(401);
        }
    });

    
    /*************************************************************************/
    // The following endpoints send requests to the Redis database and send them to the frontend
    /*************************************************************************/
    app.get('/announcements', function(req, res){        
        client.get('announcements', function (err, announcements) {
            if (announcements) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.parse(announcements));
            } else{
                res.sendStatus(404);
            }
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

    // determines whether or not someone has logged in to the website
    app.get('/officerlogin', function(req, res){ 
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;  
        var credentials = query.credentials;
        client.get('id', function (err, id) {
            if (id) {
                var keys = JSON.parse(id);
                if(keys.uuid.indexOf(credentials) >= 0){
                    res.sendStatus(200);
                } else{
                    res.sendStatus(204);
                }
                
            } else{
                res.sendStatus(204);
            }
        });
    });

    app.get('/officerlist', function(req, res) {
        client.get('officerList', function (err, officerList) {
            if(officerList){
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.parse(officerList));
            } else{
                console.error(err);
                res.sendStatus(404);
            }
        });
    });
    /*************************************************************************/
    // The following endpoints POST data to the Redis database
    /*************************************************************************/
    app.post('/announcements', function(req, res){
        client.get('announcements', function (err, announcements) {
            if (announcements) {
                if(announcements.length > 0){
                    var parsedJSON = JSON.parse(announcements);
                    var length = parsedJSON.announcements.length;
                    if(length > 1){
                        parsedJSON.announcements[length] = req.body;
                        client.set("announcements", JSON.stringify(parsedJSON));
                        res.setHeader('Content-Type', 'application/json');
                        var jsonfile = require('jsonfile');
                        jsonfile.spaces = 4;
                        var path = require("path");
                        var file = path.join(__dirname, '../metadata', 'announcements.json');
                        jsonfile.writeFile(file, parsedJSON, function(err) {
                            console.error(err);
                        });
                        console.log("Successfully  updated the announcements.json file under the metadata folder.");
                        res.send(parsedJSON);
                    } 
                } else{
                    var announcements = {};
                    announcements['announcements'] = [];
                    announcements.announcements[0] = req.body;
                    client.set("announcements", JSON.stringify(announcements));
                    res.setHeader('Content-Type', 'application/json');
                    var jsonfile = require('jsonfile');
                    jsonfile.spaces = 4;
                    var path = require("path");
                    var file = path.join(__dirname, '../metadata', 'announcements.json');
                    jsonfile.writeFile(file, announcements, function(err) {
                        console.error(err);
                    });
                    console.log("Successfully  updated the announcements.json file under the metadata folder.");
                    res.send(announcements);
                }
            } else{
                res.sendStatus(404);
            }
        }); 
    });
    /*************************************************************************/
    // The /contact endpoint sends e-mails from the form in the Contact Us page
    /*************************************************************************/
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

    

    
    /*************************************************************************/
    // The following endpoints update the newsletter and calendar data
    /*************************************************************************/
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

    // Load data from the newsletter contained in views/newsletters
    app.get('/newsletterload', function(req, res) {
        res.render('newsletter_load.html', {
            revision: revisionNumber 
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
            revision: revisionNumber 
        });
        //res.status(400).send({ error: 'HTML Error 404: Not Found!' });
    });

} // end of module exports