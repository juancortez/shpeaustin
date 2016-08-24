/*
 * IMPORTANT: followed directions from here https://developers.google.com/google-apps/calendar/quickstart/nodejs to enable Google Calendar.
 *
 * NOTE: If you are getting this error, "The API returned an error: Error: invalid_grant" navigate to the following directory and remove the
 *       calendar-nodejs-quickstart.json file.
 *      $cd /Users/{username}/.credentials/
 *      *rm calendar-nodejs-quickstart.json
 * Created credentials with: shpe.austin@gmail.com
 */

// shpe.austin@gmail.com
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at private_credentials/google_calendar.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = __dirname + ""
var path = require("path");
var TOKEN_DIR = path.join(__dirname, '../private_credentials/');
var TOKEN_PATH = TOKEN_DIR + 'google_calendar.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            listEvents(oauth2Client, callback);
        }
    });
}

module.exports.authorize = authorize;

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
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
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, callback) {
    var calendar = google.calendar('v3');
    var ignoreCalendars = ["PNS", "UT-SHPE"]; // these are the calendars we do NOT want

    var calendars = [];
    calendar.calendarList.list({
        auth: auth
    },function(err, response){
        if(err){
            console.error("Error in calendarList request...");
            getCalendarData(true);
            return;
        }
        var length = response && response.items && response.items.length || 0;
        if(!!length){
            for(var i = 0; i < length; i++){
                var summary = response.items.summary || "";
                if(ignoreCalendars.indexOf(response.items.summary) != -1){
                    console.log("Skipping calendar, " + response.items.summary);
                    continue; // we do not want to add these calendars
                }
                calendars.push(response.items[i].id);
            }    
            getCalendarData(false, calendar, auth, calendars, callback);
        } else{
            console.error("No calendars found in google calendar...");
            getCalendarData(true);
        }
    }, getCalendarData);
}

/** 
* Expected Result (ID's may be different after calendar updates)
*
* [ 'kjafd76b45ppei9cqrqfkehpog@group.calendar.google.com',
*  'pmhd6fb6o030dtki70fjum20hk@group.calendar.google.com',
*  '4bumfk6mje8i8nsooi47g55uvc@group.calendar.google.com',
*  'jso59da9rnj4psf3lt62k041o8@group.calendar.google.com',
*  'icqddk5kdtq61r4vcjdc2ffgg0@group.calendar.google.com',
*  'ecll01ko711rabcuha4udusqg0@group.calendar.google.com',
*  'shpe.austin@gmail.com',
*  'u3auomldt06gtokg9qk4dls6io@group.calendar.google.com',
*  'en.usa#holiday@group.v.calendar.google.com' ]
*/
function getCalendarData(err, calendar, auth, calendars, callback){
    if(!!err){
        callback(true);
        return;
    }

    var calendarJSON = {
        calendar: []
    };

    var numCalendars = calendars.length,
        calendarsProcessed = 0;

    for(var i = 0; i < numCalendars; i++){
        calendar.events.list({
            auth: auth,
            calendarId: calendars[i],
            timeMin: (new Date()).toISOString(),
            maxResults: 5,
            singleEvents: true,
            orderBy: 'startTime'
        }, function(err, response) {
            if (err) {
                console.error('The API returned an error: ' + err);
                calendarsProcessed++;
                if(calendarsProcessed == numCalendars){
                    sendServerResponse(calendarJSON, callback);
                }
                return;
            }
            var events = response.items;

            //console.log(events);
            if (events.length == 0) {
                console.log('No upcoming events found.');
            } else {
                //console.log('Upcoming 10 events:');
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var start = event.start.dateTime || event.start.date;

                    calendarJSON.calendar.push({
                        "event": event.summary,
                        "time": start,
                        "link": event.htmlLink,
                        "location": event.location 
                    });
                    //console.log('%s - %s', start, event.summary);
                }
            }
            calendarsProcessed++;
            if(calendarsProcessed == numCalendars){
                sendServerResponse(calendarJSON, callback);
            }

        });  
    }
}

function sendServerResponse(data, callback){
    // sort before sending it to the front end
    var answer = data.calendar.sort(function(a,b){
       return new Date(a.time).getTime() - new Date(b.time).getTime()
    })
    data.calendar = answer;

    var jsonfile = require('jsonfile');
    jsonfile.spaces = 4;
    var file = path.join(__dirname, '../metadata', 'calendar_data.json');
    jsonfile.writeFile(file, data, function(err) {
        if(err){
            console.error(err);
            return;
        }
        console.log("Successfully created the calendar_data.json file under the metadata folder.");
        callback(false, data);
    });
}



module.exports.listEvents = listEvents;