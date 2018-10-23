const googleDrive = require('./../services/google_drive');
const cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    request = require('request'),
    config = require('config');

module.exports = {
    /*
        Sample from OneDrive:

        /hackathon/office/online?user_id=109727762932844636603&state=%7B%22ids%22:%5B%220B47jM0sGy6hTamo0bHRPZjUyc3BFNGcxbHF3NFpkbjU4WC13%22%5D,%22action%22:%22open%22,%22userId%22:%2212345%22%7D
    */
    fileIdExists: (req, res, next) => {
        let state = req && req.query && req.query.state ? req.query.state : {};

        if (typeof state === "string") {
            try {
                state = JSON.parse(state);
            } catch(e) {
                return res.statu(400).send("Invalid request, must include valid state object");
            }
        }
        
        const ids = state && state.ids ? state.ids : [];
        const fileId = ids && ids.length > 0 ? ids[0] : "";

        res.locals.fileId = fileId;

        if (!fileId) {
            return res.status(400).send("Must send Google Drive fileId, exiting gracefully.");
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
        const fileId = res.locals.fileId;
        googleDrive.getFile(fileId, (err, response) => {
            if (err || !response) {
                const errMessage = `GoogleDriveAPI unable to retrieve ${fileId}`;
                console.error(err);
                return res.status(400).send(errMessage);
            }

            let { id, fileExtension } = response;

            if (!id || !fileExtension) {
                // TODO: can try fetching the file extension via parsing JSON object
                return res.status(400).send(`
                    GoogleDrive API did not return required information for id ${fileId}.
                    Received id:${id} and fileExtension:${fileExtension}
                `);
            }

             // BUG on how bluemix exposes file names, must be lowercase
            id = id.toLocaleLowerCase();
            fileExtension = fileExtension.toLocaleLowerCase();

            res.locals.fileInfo = {
                id,
                fileExtension
            };

            return next();
        });
    },
    downloadFile: (req, res, next) => {
        const {
            id,
            fileExtension
        } = res.locals.fileInfo;
        const { absoluteFileLocation } = config.googleDrive;

        const fileDestination = `${absoluteFileLocation}/${id}.${fileExtension}`;

        googleDrive.downloadFile(id, fileDestination, (err, response) => {
            if (err) {
                return res.status(400).send(`Unable to download ${id} file.`);
            }

            console.log(`Successfully saved ${id} document`);
            return next();
        });
    }
}