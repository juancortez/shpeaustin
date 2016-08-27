`
 DataController.js 
 Endpoint: /meeting
 
 The following endpoints enable WebRTC connection capabilities with appear.in
`
var express = require('express'),
    app = express(),
    config = require('config'),
    database = require("../lib/database.js"),
    revision = config.revision;

app.get('/', function(req, res){
    database.getCachedData("revisionNumber", function(err, data){
        if(!!err){
            console.error(err.reason);
        }
        revision = (!(!!err)) ? data.revision : revision;
	    res.render('meeting.html', {
	        revision: revision 
	    });
    });
});

app.get('/officermeeting', function(req, res){
    database.getCachedData("revisionNumber", function(err, data){
        if(!!err){
            console.error(err.reason);
        }
        revision = (!(!!err)) ? data.revision : revision;
	    res.render('officer_meeting.html', {
	        revision: revision 
	    });
    });
});

module.exports = app;