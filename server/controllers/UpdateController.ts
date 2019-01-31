`
    UpdateController.js 
    Endpoint: /update

    The following endpoints update data in the Redis Database and /metadata folder
`
/// <reference path="../router/main.ts" />
namespace Routes {
    const express = require('express'),
        app = express(),
        config = require('config'),
        path = require('path'),
        SettingsProvider = require('../lib/settingsProvider'),
        authorization = require('../lib/authorization.js').authorization,
        Logger = require('./../lib/logger').createLogger("<UpdateController>"),
        database = require('../lib/database.js'),
        exporter = require('../lib/exporter.js'),
        BotKitHelper = require('../services/botkit'),
        revision = config.revision;

    // posts an announcement to the redis database
    app.post('/announcements', authorization.mixedAuth, (req, res) => {
        let key = "announcements";
        database.getCachedData(key, (err, data) => {
            const newAnnouncement = req.body;
            const {
                officer,
                timestamp,
                announcement
            } = newAnnouncement;

            if (!(!!officer) || !(!!timestamp) || !(!!announcement)) {
                Logger.error("Did not send appropriate inputs for a new announcement.");
                return res.status(400).send("Did not send appropriate inputs for a new announcement.");
            }

            const announcements = data || [];
            announcements.push(newAnnouncement);

            database.setData(key, JSON.stringify(announcements), (err) => {
                if (err) {
                    Logger.error(`Error: ${err.reason}`);
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
                            Logger.error(err.reason);
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
    app.post('/jobs', authorization.mixedAuth, (req, res) => {
        let key = "jobs";
        database.getCachedData(key, (err, data) => {
            const jobs = data || [];

            const newJob = req.body || {};
            const {
                position,
                company,
                description,
                url,
                ts,
                poster
            } = newJob;

            if (!(!!position) || !(!!company) || !(!!description) || !(!!url) || !(!!ts) || !(!!poster)) {
                Logger.error("Did not send appropriate inputs for a new job posting.");
                return res.status(400).send("Did not send appropriate inputs for a new job posting.");
            }

            newJob.ts = +newJob.ts;

            jobs.push(newJob);

            jobs.sort((a, b) => {
                return b.ts - a.ts; // sort based on timestamp
            });

            database.setData(key, JSON.stringify(jobs), (err) => {
                if (err) {
                    Logger.error(`Error: ${err.reason}`);
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
                            Logger.error(err.reason);
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
                Logger.error(`${err.reason}`);
                return res.status(400).send(err.reason);
            }

            let newLink = req.body.link || "";
            let redisData = data;

            if(!newLink.includes('viewform?embedded=true')){
                Logger.error(`Link did not contain an embedded flag for an iframe.`);
                return res.status(400).send(`Link did not contain an embedded flag for an iframe.`);
            }
            
            
            if(!!newLink) redisData.google_form.link = newLink;
            else return res.status(400).send(`Did not provide a link for the ${key} database key.`);

            database.setData(key, JSON.stringify(redisData), (err) => {
                if (!!err) {
                    Logger.error(`Error: ${err.reason}`);
                    return res.status(400).send(err.reason);
                }
                Logger.log("Successully saved and cached calendar to Redis!");
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send(redisData);
            });
        });
    });

    // updates Google Calendar data in the Redis Database
    app.post('/calendar', authorization.auth, (req, res) => {
        // Get access to the Google Calendar
        const google_calendar = require('../services/google_calendar.js');
        const google_content = SettingsProvider.getCredentialByPath(["google_oauth"]);

        google_calendar.authorize(google_content, (err, results) => {
            if (!!err) {
                Logger.error(`${err.reason}`);
                return res.status(400).send(err.reason);
            }

            database.setData('calendar', JSON.stringify(results), (err) => {
                if (!!err) {
                    Logger.error(`Error: ${err.reason}`);
                    return res.status(400).send(err.reason);
                }
                Logger.log("Successully saved and cached calendar to Redis!");
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send(results);
            });
        });
    });

    app.post('/cache', (req, res) => {
        var key = req && req.body && req.body.key || "";
        if (!!key) {
            database.updateCache(key, (err, response) => {
                if (err) {
                    Logger.error(`Error: ${err.reason}`);
                    return res.status(400).send(`Error: ${err.reason}`);
                }
                Logger.log("Successfully updated local cache from Redis database.");
                res.status(200).send(response);
            });
        } else {
            res.status(400).send("Did not provide a key");
        }
    });

    // removes spaces before and after string, as well as any line breaks (\n)
    function _cleanText(str) {
        return str.trim().replace(/(\r\n|\n|\r)/gm, " ");
    }

    function _sendToSlack({officer,timestamp, announcement}){
        const botKitHelper = new BotKitHelper();

        botKitHelper.sendMessage({
            'message': "New Announcement",
            'channelName': "shpe-austin",
            'attachment': {
                'type': "announcement",
                'author': officer,
                'announcement': announcement
            },
            cb: (err) => {
                if(err) return Logger.error(err);
                Logger.log("Successully posted announcement on Slack!");
            }
        });
    }

    module.exports = app;
}