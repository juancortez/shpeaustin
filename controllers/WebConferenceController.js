/*************************************************************************/
// The following endpoints enable WebRTC connection capabilities with appear.in
/*************************************************************************/
var express = require('express'),
    app = express(),
    config = require('config'),
    revision = config.revision;

app.get('/', function(req, res){
    res.render('meeting.html', {
        revision: revision 
    });
});

app.get('/officermeeting', function(req, res){
    res.render('officer_meeting.html', {
        revision: revision 
    });
});

module.exports = app;