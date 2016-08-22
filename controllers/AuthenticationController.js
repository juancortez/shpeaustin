/*************************************************************************/
// AuthenticationController.js 
// Endpoint: /authentication
// 
// The following endpoints authenticate users
/*************************************************************************/
var express = require('express'),
    app = express(),
    uuid = require('node-uuid'),
    authorization = require('../lib/authorization.js').authorization;
 
app.post('/login', authorization.webAuth, function(req, res) {
    console.log("Login successful!");
    var client = req.app.get('redis');

    //store all users that have logged in
    client.get('id', function(err, redisId) {
        if (redisId) {
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
        } else {
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
});

module.exports = app;