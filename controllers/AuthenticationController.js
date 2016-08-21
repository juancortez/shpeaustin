/*************************************************************************/
// The following endpoints authenticate users
/*************************************************************************/
var express = require('express'),
    app = express(),
    uuid = require('node-uuid'),
    privateCredentials = require('../private_credentials/credentials.json');


app.post('/login', function(req, res){
    // VERY basic authentication
    var client = req.app.get('redis');  
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

module.exports = app;