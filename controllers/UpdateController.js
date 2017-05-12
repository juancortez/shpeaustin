`
    UpdateController.js 
    Endpoint: /update

    The following endpoints update data in the Redis Database and /metadata folder
`
const express = require('express'),
    app = express(),
    config = require('config'),
    path = require('path'),
    privateCredentials = require('../lib/credentialsBuilder.js').init(),
    authorization = require('../lib/authorization.js').authorization,
    database = require('../lib/database.js'),
    exporter = require('../lib/exporter.js');
let revision = config.revision;

// posts an announcement to the redis database
app.post('/announcements', authorization.cookieAuth, (req, res) => {
    let key = "announcements";
    database.getCachedData(key, (err, data) => {
        if (!!err) {
            console.warn(`${key} key doesn't exist, so creating announcements.`);
            data = null;
        }
        let announcements = data && data.announcements || null,
            newAnnouncement = req.body || null,
            {
                officer,
                timestamp,
                announcement
            } = newAnnouncement;

        if (!(!!officer) || !(!!timestamp) || !(!!announcement)) {
            console.error("Did not send appropriate inputs for a new announcement.");
            return res.status(400).send("Did not send appropriate inputs for a new announcement.");
        }

        let length = announcements && announcements.length || 0;
        if (!(!!length)) {
            announcements = [];
        }
        announcements[length] = newAnnouncement;
        database.setData(key, JSON.stringify({
            announcements: announcements
        }), (err) => {
            if (err) {
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(`Error: ${err.reason}`);
            }
            const destination = path.join(__dirname, '../metadata', 'announcements.json');

            exporter.save.json({
                destination,
                filename: "announcements.json", 
                data: {
                    announcements: announcements
                }, 
                cb: (err, data) => {
                    if(err){
                        console.error(err.reason);
                    }
                    return res.json({
                        announcements: announcements
                    });
                }
            });
        });

    });
});

// posts a new job to the redis database
app.post('/jobs', authorization.cookieAuth, (req, res) => {
    let key = "jobs";
    database.getCachedData(key, (err, data) => {
        if (!!err) {
            console.warn(`${key} key doesn't exist, so creating jobs.`);
            data = null;
        }
        let jobs = data && data.jobs || null,
            newJob = req.body || null,
            {
                position,
                company,
                description,
                url,
                ts,
                poster
            } = newJob;

        if (!(!!position) || !(!!company) || !(!!description) || !(!!url) || !(!!ts) || !(!!poster)) {
            console.error("Did not send appropriate inputs for a new job posting.");
            return res.status(400).send("Did not send appropriate inputs for a new job posting.");
        }

        newJob.ts = +newJob.ts;

        let length = jobs && jobs.length || 0;
        if (!(!!length)) {
            jobs = [];
        }
        jobs[length] = newJob;

        jobs.sort((a, b) => {
            return b.ts - a.ts; // sort based on timestamp
        });

        database.setData(key, JSON.stringify({
            jobs: jobs
        }), (err) => {
            if (err) {
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(`Error: ${err.reason}`);
            }
            
            const destination = path.join(__dirname, '../metadata', 'jobs.json');
            exporter.save.json({
                destination,
                filename: "jobs.json", 
                data: {
                    jobs: jobs
                }, 
                cb: (err, data) => {
                    if(err){
                        console.error(err.reason);
                    }
                    return res.json({
                        jobs
                    });
                }
            });
        });

    });
});

app.put('/survey', (req, res) => {
    let key = "googleForm"
    database.getCachedData(key, function(err, data){
        if(!!err){
            console.error(`${err.reason}`);
            return res.status(400).send(err.reason);
        }

        let newLink = req.body.link || "";
        let redisData = data;

        if(!newLink.includes('viewform?embedded=true')){
            console.error(`Link did not contain an embedded flag for an iframe.`);
            return res.status(400).send(`Link did not contain an embedded flag for an iframe.`);
        }
        
        
        if(!!newLink) redisData.google_form.link = newLink;
        else return res.status(400).send(`Did not provide a link for the ${key} database key.`);

        database.setData(key, JSON.stringify(redisData), (err) => {
            if (!!err) {
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(err.reason);
            }
            console.log("Successully saved and cached calendar to Redis!");
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).send(redisData);
        });
    });
});

// updates Google Calendar data in the Redis Database
app.post('/calendar', authorization.auth, (req, res) => {
    // Get access to the Google Calendar
    const google_calendar = require('../services/google_calendar.js'),
        google_content = privateCredentials.google_oauth;

    google_calendar.authorize(google_content, (err, results) => {
        if (!!err) {
            console.error(`${err.reason}`);
            return res.status(400).send(err.reason);
        }

        database.setData('calendar', JSON.stringify(results), (err) => {
            if (!!err) {
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(err.reason);
            }
            console.log("Successully saved and cached calendar to Redis!");
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).send(results);
        });
    });
});


// removes spaces before and after string, as well as any line breaks (\n)
function _cleanText(str) {
    return str.trim().replace(/(\r\n|\n|\r)/gm, " ");
}


app.post('/cache', (req, res) => {
    var key = req && req.body && req.body.key || "";
    if (!!key) {
        database.updateCache(key, (err, response) => {
            if (err) {
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(`Error: ${err.reason}`);
            }
            console.log("Successfully updated local cache from Redis database.");
            res.status(200).send(response);
        });
    } else {
        res.status(400).send("Did not provide a key");
    }
});

module.exports = app;