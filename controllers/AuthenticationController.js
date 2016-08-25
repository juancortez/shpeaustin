/*************************************************************************/
// AuthenticationController.js 
// Endpoint: /authentication
// 
// The following endpoints authenticate users
/*************************************************************************/
var express = require('express'),
    app = express(),
    uuid = require('node-uuid'),
    database = require('../lib/database.js'),
    authorization = require('../lib/authorization.js').authorization;
 
app.post('/login', authorization.webAuth, function(req, res) {
    console.log("Login successful!");
    var key = "id",
        uniqueId = uuid.v4();
    //store all users that have logged in
    database.getCachedData(key, function(err, data){
        if(!!err){
            if(err.reason === (key + " not found in cache")){
                var id = {}; // create new id and store in redis database
                id.uuid = [];
                id.uuid.push(uniqueId);
                var result = id;
            } else{
                console.error(err.reason);
                return;
            }
        } else if(!!data){
            data.uuid.push(uniqueId); // push new uuid
            var result = data;
        } else{
            return res.status(400).send("Invalid data passed from database");
        }

        database.setData(key, JSON.stringify(result), function(err){
            if(err){
                console.error("Error: " + err.reason);
                return res.status(400).send(err.reason);
            }
            console.log("id data successully set on Redis database!");
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).send({uuid: uniqueId});
        });
    });
});

module.exports = app;