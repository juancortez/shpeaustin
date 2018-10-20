const googleDrive = require('./../services/google_drive');
const cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    request = require('request');

module.exports = {
    fileExists: (req, res, next) => {
        const fileId = req && req.query && req.query.fileId || "";

        if (!fileId) {
            return res.status(400).send("Must sending Google Drive fileId, exiting gracefully.");
        }

        return next();
    },
    googleDriveAuth: (req, res, next) => {
        const requestHost = appEnv.isLocal ? "localhost:6001" : "us.austinshpe.org";

        request(`http://${requestHost}/hackathon/office/authorize`, function(err, response, body) {
            if (err) {
                return res.status(500).send("Unable to get authorization token for google drive api, " + err);
            }

            return next();
        });
    },
    getFile: (req, res, next) => {
        const fileId = req && req.query && req.query.fileId || "";

        googleDrive.getFile(fileId, (err, response) => {
            if (err || !response) {
                return res.status(400).send(err);
            }

            res.locals.fileInfo = response;
            return next();
        });
    },
    downloadFile: (req, res, next) => {
        const {
            id,
            webContentLink,
            fileExtension
        } = res.locals.fileInfo;

        const fileDestination = `./public/assets/${id}.${fileExtension}`;

        googleDrive.downloadFile(fileId, fileDestination, (err, response) => {
            if (err) {
                return res.status(400).send(`Unable to download ${fileId} file.`);
            }

            console.log(`Successfully saved ${fileId}`);
            return next();
        });
    }
}