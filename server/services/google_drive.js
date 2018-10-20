const fs = require('fs');
const readlineSync = require('readline-sync'),
    google = require('googleapis'),
    googleAuth = require('google-auth-library');

const cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv();

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', "https://www.googleapis.com/auth/drive.appdata", "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.metadata", "https://www.googleapis.com/auth/drive.metadata.readonly", "https://www.googleapis.com/auth/drive.photos.readonly", "https://www.googleapis.com/auth/drive.readonly"],
    path = require("path");
    TOKEN_DIR = path.join(__dirname, '../private_credentials/');
    TOKEN_PATH = TOKEN_DIR + 'google_drive.json';

let GOOGLE_AUTH = null;

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret,
        clientId = credentials.installed.client_id,
        redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);


    if(appEnv.isLocal) {
    // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          return getAccessToken(oauth2Client, callback);
        }

        oauth2Client.credentials = JSON.parse(token);
        GOOGLE_AUTH = oauth2Client;
        return callback(null, oauth2Client);
      });
    } else {
        try{
            oauth2Client.credentials = require('../lib/credentialsBuilder.js').init().googleDriveCredentials;
            GOOGLE_AUTH = oauth2Client;
            return callback(null);
        } catch(e){
            console.error("Unable to access credentials");
            return callback(e);
        }
    }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  const code = readlineSync.question('Enter the code from that page here: ');

  oAuth2Client.getToken(code, (err, token) => {
    if (err) {
      const errMessage = 'Error retrieving access token' + err;
      return callback(errMessage);
    }

    oAuth2Client.credentials = token;

    storeToken(token, callback);
    GOOGLE_AUTH = oAuth2Client;
    return callback(null, oAuth2Client);
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            console.error("Error in storing token");
            console.error(err);
        }
    }

    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

function getFile(fileId, cb) {
  const drive = google.drive({version: 'v2', GOOGLE_AUTH});
  drive.files.get({
    fileId: fileId
  }, (err, res) => {
    if (err) {
      return cb(err);
    } else {
      return cb(null, res);
    }
  });
}

function downloadFile(id, location, cb) {
    const file = fs.createWriteStream(location);

    const params = {
        fileId: id,
        alt : 'media'
    };

    const drive = google.drive({version: 'v2', GOOGLE_AUTH});

    drive.files.get(params)
      .on('end', function () {
        return cb(null);
      })
      .on('error', function (err) {
        return cb(err);
      })
      .pipe(file);
}

module.exports = {
    authorize: authorize,
    getFile: getFile,
    downloadFile: downloadFile
};


