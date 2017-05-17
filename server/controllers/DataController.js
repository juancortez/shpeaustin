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
    privateCredentials = require('../lib/credentialsBuilder.js').init();

// determines whether or not someone has logged in to the website
app.get('/officerlogin', authorization.mixedAuth, (req, res) => { 
    return res.sendStatus(200);
});

app.get('/all/keys', authorization.mixedAuth, (req, res) => {
    database.getKeys((err, keys) => {
        if (err) {
            console.error(`Error: ${err.reason}`);
            return res.status(400).send(err.reason);
        }
        return res.status(200).send(keys);
    });
});

app.get('/:key', (req, res) => {
    let key = req && req.params && req.params.key || "";
    
    if(key === "id"){
        return res.status(400).send(`Unauthorized access to this information.`);
    }

    if(!!key){
        database.getCachedData(key, (err, data) => {
            if(!!err){
                console.error(err.reason);
                return res.status(400).send(err.reason); // doesn't exist
            }
            console.log(`Successfully retrieved ${key}!`);
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(data);
        });
    } else{
        return res.status(400).send("No key provided"); // bad request
    }
});

app.delete('/:key', authorization.mixedAuth, (req, res) => {
    let key = req && req.params && req.params.key || "";

    if(!!key){
        database.deleteData(key, function(err){
            if(err){
                console.error(`Error: ${err.reason}`);
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


app.put('/:key', authorization.mixedAuth, (req, res) => {
    let key = req && req.params && req.params.key || "",
        data = req && req.body || null;

    if(!(!!key) || !(!!data)){
        return res.status(400).send("No key and/or data provided."); // bad request
    }

    if(key === "calendar"){
        const credentials = privateCredentials.websiteLogin,
            authorizationToken = credentials.username + ":" + credentials.password;

        const request = require("request"),
            authorization = "Basic " + new Buffer(authorizationToken).toString('base64'),
            baseUrl = req.protocol + '://' + req.get('host');

        const options = { 
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