const googleDrive = require('./../services/google_drive');
const cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    request = require('request'),
    config = require('config');

module.exports = {
    fileExists: (req, res, next) => {
        const fileId = req && req.query && req.query.fileId || "";

        if (!fileId) {
            return res.status(400).send("Must sending Google Drive fileId, exiting gracefully.");
        }

        return next();
    },
    googleDriveAuth: (req, res, next) => {
        const requestHost = appEnv.isLocal ? "http://localhost:6001" : "http://us.austinshpe.org";

        request(`${requestHost}/hackathon/office/authorize`, function(err, response, body) {
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
                const errMessage = `GoogleDriveAPI unable to retrieve ${fileId}`;
                console.error(err);
                return res.status(400).send(errMessage);
            }

            res.locals.fileInfo = response;
            return next();
        });
    },
    downloadFile: (req, res, next) => {
        const {
            id,
            fileExtension
        } = res.locals.fileInfo;
        const { absoluteFileLocation } = config.googleDrive;
        const lowerCaseId = id.toLocaleLowerCase(); // BUG on how bluemix exposes file names, must be lowercase
        const lowerCaseFileExt = fileExtension.toLocaleLowerCase();

        const fileDestination = `${absoluteFileLocation}/${lowerCaseId}.${lowerCaseFileExt}`;

        googleDrive.downloadFile(id, fileDestination, (err, response) => {
            if (err) {
                return res.status(400).send(`Unable to download ${id} file.`);
            }

            console.log(`Successfully saved ${id} document`);
            return next();
        });
    }
}