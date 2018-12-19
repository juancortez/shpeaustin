`
    CommunicationController.js 
    Endpoint: /hackathon

    Hackathon related server code
`

const express = require('express'),
    app = express(),
    config = require('config');
const viewsDirectory = './public/views/';

const googleDrive = require('./../services/google_drive');
const middleware = require('./../middleware/HackathonMiddleware');

/*
    Get a Google Drive document by an ID and display it in office online
        eg. /hackathon/office/online?fileId=1nx_WkZqVoTGgkMzg6joZUkcm6KHDSThl
*/
app.get('/office/online', middleware.fileIdExists, middleware.googleDriveAuth, middleware.getFile, middleware.downloadFile, (req, res) => {
    const { officeOnlineUrl, localFileLocation } = config.googleDrive;
    const { id, fileExtension } = res.locals.fileInfo;

    const requestHost = "http://us.austinshpe.org";

    // Example: https://view.officeapps.live.com/op/view.aspx?src=http://us.austinshpe.org/assets/document.docx
    const redirectUrl = officeOnlineUrl + requestHost + localFileLocation + `/${id.toLocaleLowerCase()}.${fileExtension}`;
    console.log(`Redirecting to ${redirectUrl}`);

    return res.redirect(redirectUrl);
});

app.get('/office/authorize', (req, res) => {
    googleDrive.authorize((err) => {
        if (err) {
            console.error("Unable to get google drive token");
            return res.status(400).send(err);
        }

        return res.status(200).send("Google drive successfully authorized");
    });
});

app.get('/office/getFiles', middleware.googleDriveAuth, (req, res) => {
    googleDrive.getFiles((err, files) => {
        if (err) {
            console.error(err);
            return res.status(400).send(err);
        }

        return res.json(files);
    });
});

app.get('/office/privacy', (req, res) => {
    return res.sendFile(viewsDirectory + 'hackathon_privacy.html', { root: "." });
});

module.exports = app;