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

const BlinkApi = require('./../services/blink');
const { to } = require('../lib/utils');

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

app.get('/blink/isArmed', middleware.blinkAuth, async (req, res) => {
    const blinkApi = getBlinkInstance();
    const [err, result] = await to(blinkApi.isArmed());

    if (err) {
        console.error(err);
        return res.status(400).send("Unable to detect, please try again later.");
    } else {
        return res.status(200).send(`Blink is armed: ${result}`);
    }
});

app.get('/blink/setArm', middleware.blinkAuth, async (req, res) => {
    const shouldArmQuery = req.query.arm || false;
    const shouldArm = shouldArmQuery == 'true';
    const armModeStr = shouldArm ? "armed mode" : "unarmed mode";

    const blinkApi = getBlinkInstance();

    const [err] = await to(blinkApi.setArmed(shouldArm));

    if (err) {
        return res.status(400).send(`Unable to perform operation to arm the system to ${armModeStr}`);
    } else {
        return res.status(200).send(`Blink successful set to: ${armModeStr}`);
    }
});

function getBlinkInstance() {
    return BlinkApi.getInstance();
}

module.exports = app;