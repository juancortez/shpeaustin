/*************************************************************************/
// The following endpoints send requests to the Redis database and send them to the frontend
/*************************************************************************/
var express = require('express'),
    app = express();

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

module.exports = app;