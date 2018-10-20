`
    CommunicationController.js 
    Endpoint: /hackathon

    Hackathon related server code
`

const express = require('express'),
    app = express();

const privateCredentials = require('../lib/credentialsBuilder.js').init();
const googleDrive = require('./../services/google_drive');
const middleware = require('./../middleware/HackathonMiddleware');


/*
    Get a Google Drive document by an ID:
        /hackathon/office/online?id=1nx_WkZqVoTGgkMzg6joZUkcm6KHDSThl
*/
app.get('/office/online', middleware.fileExists, middleware.googleDriveAuth, middleware.getFile, middleware.downloadFile, (req, res) => {
    return res.status(200).send("All good!");
});

app.get('/office/authorize', (req, res) => {
    // TODO: determine if API actually failed
    googleDrive.authorize(privateCredentials.google_onedrive_oath, (googleDriveAuth) => {
        return res.status(200).send("Google drive successfully authorized");
    });
});



module.exports = app;