/*************************************************************************/
// DataController.js 
// Endpoint: /data
// 
// The following GET endpoints send requests to the Redis database and send the
// data to the front end.
// 
// The DELETE endpoints remove the data from the Redis database.  
/*************************************************************************/
var express = require('express'),
    app = express(),
    authorization = require('../lib/authorization.js').authorization,
    privateCredentials = require('../private_credentials/credentials.json');

// sends front end the metedata/announcements.json file
app.get('/announcements', function(req, res){
    var client = req.app.get('redis');   
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
    var client = req.app.get('redis');
    client.get('calendar', function (err, calendarData) {
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
    var client = req.app.get('redis');
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
    var client = req.app.get('redis'),
        credentials = req.query.credentials;

    client.get('id', function (err, id) {
        if (id) {
            var keys = JSON.parse(id);
            if(keys.uuid.indexOf(credentials) >= 0){
                res.sendStatus(200);
            } else{
                res.sendStatus(401); // HTTP Code: Unauthorized
            }
            
        } else{
            res.sendStatus(401); // HTTP Code: Unauthorized
        }
    });
});

app.get('/officerlist', function(req, res) {
    var client = req.app.get('redis');
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

app.delete('/:key', authorization.webAuth, function(req, res) {
    var client = req.app.get('redis');
    var key = req && req.params && req.params.key || "";

    var backupKey = function(callback){
        var backup = {};
        client.get(key, function(err, reply) {
            if (err) {
                res.sendStatus(400); // doesn't exist
                console.error(err);
                return;
            } else {
                backup[key] = JSON.parse(reply);
            }
            backupRedisOnClear(key, backup, callback);
        });
    };
    
    // Save a backup of all Redis database and place it in /metadata/backup.json
    var backupRedisOnClear = function(key, backup, callback) {
        var path = require("path");
        var jsonfile = require('jsonfile');
        jsonfile.spaces = 4;
        var file = path.join(__dirname, '../metadata/backup/', key + '_backup.json');
        jsonfile.writeFile(file, backup, function(err) {
            if(err){
                console.error(err);
            }
            console.log("Backup processed and successfully saved under metadata/backup/" + key + '_backup.json');
            callback();
        });
    }

    var deleteKey = function(){
        client.del(key, function(err, reply) {
            if (err) {
                console.error(err);
            }
            if (reply == 1) {
                console.log("Successfully delete key: " + key);
            }
        });
        res.sendStatus(200);
    };

    if(!!key){
        backupKey(deleteKey);
    } else{
        res.sendStatus(400); // bad request
        return;
    }
});


app.put('/:key', authorization.auth ,function(req, res) {
    var client = req.app.get('redis'),
        key = req && req.params && req.params.key || "";

    if(!!key){
        if(key === "calendar"){
            var credentials = privateCredentials.websiteLogin,
                authorizationToken = credentials.username + ":" + credentials.password;

            var request = require("request"),
                authorization = "Basic " + new Buffer(authorizationToken).toString('base64'),
                baseUrl = req.protocol + '://' + req.get('host');

            var options = { 
                method: 'POST',
                url: baseUrl + '/update/calendar',
                headers: { 
                    authorization: authorization
                }
            };

            request(options, function (error, response, body) {
              if (error){
                res.sendStatus(400);
                return;
              } 
              res.sendStatus(200);
            });
        } else{
            res.sendStatus(400).send("Not yet implemented..."); // TODO: haven't implemented yet, do it soon
            return;
        }
    } else{
        res.sendStatus(400); // bad request
        return;
    }
});



module.exports = app;