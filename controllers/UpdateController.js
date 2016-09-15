`
    UpdateController.js 
    Endpoint: /update

    The following endpoints update data in the Redis Database and /metadata folder
`
const express = require('express'),
    app = express(),
    config = require('config'),
    privateCredentials = require('../lib/credentialsBuilder.js').init(),
    authorization = require('../lib/authorization.js').authorization,
    database = require('../lib/database.js');
let revision = config.revision;

// posts an announcement to the redis database
app.post('/announcements', (req, res) => {
    let key = "announcements";
    database.getCachedData(key, (err, data) => {
        if(!!err){
            console.warn(`${key} key doesn't exist, so creating announcements.`);
            data = null;
        }
        let announcements = data && data.announcements || null,
            newAnnouncement = req.body || null,
            {officer, timestamp, announcement} = newAnnouncement;

        if(!(!!officer) || !(!!timestamp) || !(!!announcement)){
            console.error("Did not send appropriate inputs for a new announcement.");
            return res.status(400).send("Did not send appropriate inputs for a new announcement.");
        }

        let length = announcements && announcements.length || 0;
        if(!(!!length)){
            announcements = [];
        }
        announcements[length] = newAnnouncement;
        database.setData(key, JSON.stringify({announcements: announcements}), (err) => {
            if(err){
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(`Error: ${err.reason}`);
            }
            const jsonfile = require('jsonfile'),
                path = require("path"),
                file = path.join(__dirname, '../metadata', 'announcements.json');
            jsonfile.spaces = 4;

            jsonfile.writeFile(file, {announcements: announcements}, (err) => {
                if(!!err) console.error(err);
                else console.log("Successfully updated the announcements.json file under the metadata folder.");        
                return res.json({announcements: announcements});
            });
        });   
       
    });
});

// posts a new job to the redis database
app.post('/jobs', (req, res) => {
    let key = "jobs";
    database.getCachedData(key, (err, data) => {
        if(!!err){
            console.warn(`${key} key doesn't exist, so creating jobs.`);
            data = null;
        }
        let jobs = data && data.jobs || null,
            newJob = req.body || null,
            {position, company, description, url, ts, poster} = newJob;

        if(!(!!position) || !(!!company) || !(!!description) || !(!!url) || !(!!ts) || !(!!poster)){
            console.error("Did not send appropriate inputs for a new job posting.");
            return res.status(400).send("Did not send appropriate inputs for a new job posting.");
        }

        newJob.ts = +newJob.ts;

        let length = jobs && jobs.length || 0;
        if(!(!!length)){
            jobs = [];
        }
        jobs[length] = newJob;
        database.setData(key, JSON.stringify({jobs: jobs}), (err) => {
            if(err){
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(`Error: ${err.reason}`);
            }
            const jsonfile = require('jsonfile'),
                path = require("path"),
                file = path.join(__dirname, '../metadata', 'jobs.json');
            jsonfile.spaces = 4;

            jsonfile.writeFile(file, {jobs: jobs}, (err) => {
                if(!!err) console.error(err);
                else console.log("Successfully updated the jobs.json file under the metadata folder.");        
                return res.json({jobs: jobs});
            });
        });   
       
    });
});

// updates Google Calendar data in the Redis Database
app.post('/calendar', authorization.auth, (req, res) => {
    // Get access to the Google Calendar
    const google_calendar = require('../services/google_calendar.js'),
        google_content = privateCredentials.google_oauth;

    google_calendar.authorize(google_content, (err, results) => {
        if(!!err){
            console.error(`${err.reason}`);
            return res.status(400).send(err.reason);
        }
  
        database.setData('calendar', JSON.stringify(results), (err) => {
            if(!!err){
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(err.reason);
            }
            console.log("Successully saved and cached calendar to Redis!");
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).send(results);
        });
    });
});

app.post('/newsletter', (req, res) =>{
    const $ = require('cheerio'),
        path = require('path'),
        request = require('request'),
        file = path.join(__dirname, '../views/newsletters/', 'newsletters.html'),
        fs = require('fs'),
        fileDestination = path.join(__dirname, '../public/assets/newsletter/'),
        htmlString = fs.readFileSync(file).toString(),
        parsedHTML = $.load(htmlString),
        ignoreItems = ["Recommended for desktop or horizontal mobile viewing", "View this email in your browser"];
    let titlesAndDescriptions = [],
        imageLinks = [];

        parsedHTML('.footerContainer').map((i, data) => {
            let tables = $(data).children() // has table elements

            // get all titles and descriptions
            parsedHTML('.mcnTextContent').map((i, data) =>{
                let currentItem = _cleanText($(data).text());
                if(ignoreItems.indexOf(currentItem) >= 0) return; 
                else titlesAndDescriptions.push(currentItem);
            });

            // get all images
            parsedHTML('img').map((i, image) => {
                let imageSource = $(image).attr('src') || "";
                if(!!imageSource && imageSource.indexOf('cdn') == -1){
                    imageLinks.push(imageSource);    
                }
            });
        });

    const download = (uri, filename, callback) => {
        request.head(uri, (err, res, body) => {
            if(!!err){
                console.error(`There was an error downloading newsletter image: ${err}`);
                return;
            }
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

    imageLinks.forEach((image, index) =>{
        download(image, fileDestination + "newsletter" + index, () => {
            console.log(`Downloaded image, ${image}, as newsletter${index}`);
        });
    });

    if(titlesAndDescriptions.length > 0 && imageLinks.length > 0){
        const newsletterFile = path.join(__dirname, '../metadata', 'newsletter_scraped.json'),
            jsonfile = require('jsonfile');
        jsonfile.spaces = 4;
        jsonfile.writeFile(newsletterFile, {titlesAndDescriptions: titlesAndDescriptions, imageLinks: imageLinks}, (err) => {
            if(err){
                console.error(err);
                return res.sendStatus(400);    
            } else{
                console.log("Successfully created the newsletter_scraped.json file under the metadata folder.");
                return res.json({
                    titlesAndDescriptions,
                    imageLinks
                });   
            }
        });

    } else{
        console.error("Was not able to parse the newsletter.");
        res.status(204).send("Was not able to parse the newsletter.");
    }

});

// removes spaces before and after string, as well as any line breaks (\n)
function _cleanText(str){
    return str.trim().replace(/(\r\n|\n|\r)/gm," ");
}

// opens up the views/newsletters/newsletter.html page and sends it to the /newsletterload endpoint
app.get('/admin', authorization.auth, (req, res) => {
    database.getKeys((err, keys) => {
        if(err){
            console.error(`Error: ${err.reason}`);
            return res.status(400).send(err.reason);
        }

        database.getCachedData("revisionNumber", (err, data) => {
            if(!!err){
                console.error(err.reason);
            }
            revision = (!(!!err)) ? data.revision : revision;
            res.render('admin.html', {
                revision,
                keys
            });
        }); 
    });
});

app.post('/cache', (req,res) => {
    var key = req && req.body && req.body.key || "";
    if(!!key){
        database.updateCache(key, (err, response) => {
            if(err){
                console.error(`Error: ${err.reason}`);
                return res.status(400).send(`Error: ${err.reason}`);
            }
            console.log("Successfully updated local cache from Redis database.");
            res.status(200).send(response);
        });        
    } else{
        res.status(400).send("Did not provide a key");
    }
});

module.exports = app;