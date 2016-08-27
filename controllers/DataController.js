`
    DataController.js 
    Endpoint: /data

    The following GET endpoints send requests to the Redis database and send the
    data to the front end.

    The DELETE endpoints remove the data from the Redis database.  
`
const express = require('express'),
    app = express(),
    authorization = require('../lib/authorization.js').authorization,
    database = require('../lib/database.js'),
    privateCredentials = require('../private_credentials/credentials.json');

// determines whether or not someone has logged in to the website
app.get('/officerlogin', (req, res) => { 
    var credentials = req.query.credentials;

    database.getCachedData('id', (err, data) => {
        if(!!err){
            console.error(err.reason);
            return res.status(400).send(err.reason); // doesn't exist
        }
        var keys = data;
        if(keys.uuid.indexOf(credentials) >= 0){
            return res.sendStatus(200);
        } else{
            return res.sendStatus(401); // HTTP Code: Unauthorized
        }
    });
});

app.get('/:key', (req, res) => {
    var key = req && req.params && req.params.key || "";

    if(!!key){
        database.getCachedData(key, (err, data) => {
            if(!!err){
                console.error(err.reason);
                return res.status(400).send(err.reason); // doesn't exist
            }
            console.log(`Successfully retrieved ${key}!`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).send(data);
        });
    } else{
        return res.status(400).send("No key provided"); // bad request
    }
});

app.delete('/:key', authorization.auth, (req, res) => {
    var key = req && req.params && req.params.key || "";

    if(!!key){
        database.deleteData(key, function(err){
            if(err){
                console.error("Error: " + err.reason);
                return res.status(400).send(err.reason); // bad request
            }
            console.log(`Successfully removed ${key} from database!`);
            return res.sendStatus(200);
        });
    } else{
        console.error("No key provided in delete request");
        return res.status(400).send("No key provided in delete request"); // bad request
    }
});


app.put('/:key', authorization.auth, (req, res) => {
    var key = req && req.params && req.params.key || "",
        data = req && req.body || null;

    if(!(!!key) || !(!!data)){
        return res.status(400).send("No key and/or data provided."); // bad request
    }

    if(key === "calendar"){
        var credentials = privateCredentials.websiteLogin,
            authorizationToken = credentials.username + ":" + credentials.password;

        var request = require("request"),
            authorization = "Basic " + new Buffer(authorizationToken).toString('base64'),
            baseUrl = req.protocol + '://' + req.get('host');

        var options = { 
            method: 'POST',
            url: `${baseUrl}/update/calendar`,
            headers: { 
                authorization: authorization
            }
        };

        request(options, (error, response, body) => {
          if (error){
            return res.sendStatus(400);
          } 
          return res.sendStatus(200);
        });
    } else if(key === "officerList"){
        const util = require('../utils/utils.js');
        util.parseOfficerJSON(data, (err, data) => {
            if(err){
                console.error(err.reason);
                return res.status(400).send(err.reason);
            }
            database.setData(key, JSON.stringify(data), (err) => {
                if(err){
                    console.error(`Error: ${err.reason}`);
                    res.status(400).send(err.reason);
                }
                console.log(`Successully saved and cached ${key} to Redis!`);
                return res.sendStatus(200);
            });
        });
    } else{
        database.setData(key, JSON.stringify(data), (err) => {
            if(err){
                console.error(`Error: ${err.reason}`);
                res.status(400).send(err.reason);
            }
            console.log(`Successully saved and cached ${key} to Redis!`);
            return res.sendStatus(200);
        });
    }
});

module.exports = app;