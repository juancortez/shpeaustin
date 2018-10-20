`
    CommunicationController.js 
    Endpoint: /hackathon

    Hackathon related server code
`

const express = require('express'),
    app = express(),
    config = require('config');

const privateCredentials = require('../lib/credentialsBuilder.js').init();
const googleDrive = require('./../services/google_drive');
const middleware = require('./../middleware/HackathonMiddleware');


/*
    Get a Google Drive document by an ID and display it in office online
        eg. /hackathon/office/online?id=1nx_WkZqVoTGgkMzg6joZUkcm6KHDSThl
*/
app.get('/office/online', middleware.fileExists, middleware.googleDriveAuth, middleware.getFile, middleware.downloadFile, (req, res) => {
    const { officeOnlineUrl, localFileLocation } = googleDrive;
    const { id, fileExtension } = res.locals.fileInfo;
    const lowerCaseId = id.toLocaleLowerCase(); // BUG on how bluemix exposes file names, must be lowercase
    const lowerCaseFileExt = fileExtension.toLocaleLowerCase();
    return res.redirect(officeOnlineUrl + localFileLocation + `/${lowerCaseId}.${lowerCaseFileExt}`);
});

app.get('/office/authorize', (req, res) => {
    googleDrive.authorize(privateCredentials.google_onedrive_oath, (err, googleDriveAuth) => {
        if (err) {
            console.error("Unable to get google drive token");
            return res.status(400).send(err);
        }

        return res.status(200).send("Google drive successfully authorized");
    });
});

module.exports = app;