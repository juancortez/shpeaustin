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
            client.set('id', JSON.stringify(uuidRedis), function(err, reply){
                if(err){
                    console.error();
                    return res.sendStatus(400);
                }
                // send id JSON to front end
                console.log("id data successully set on Redis database!");
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send(id);
            });
        } else {
            // create JSON to send to front end
            var uuidNumber = uuid.v4();
            var id = {};
            id['uuid'] = [];
            id.uuid.push(uuidNumber);
            // create the 'id' key on the Redis database
            client.set('id', JSON.stringify(id), function(err, reply){
                if(err){
                    console.error();
                    return res.sendStatus(400);
                }
                // send id JSON to front end
                console.log("id data successully set on Redis database!");
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send(id);
            });
        }
    });
});

module.exports = app;