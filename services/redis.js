/*
 * The onRedisConnection function gets called when redis has connected. The purpose of this
 * file is to cache all files under the /metadata folder for faster web browsing loading times.
 *
 * The data cached by this file gets called by the main.js router file.
 *
 */

var config = require('config'),
    revision = config.revision;

function onRedisConnection(client, redis) {
    console.log('Connected to Redis');

    //cache metadata files into redis
    client.get("officerList", function(err, reply) {
        if (err) {
            console.error("Error: " + err);
        } else {
            if (reply == null) {
                try {
                    var util = require('../utils/utils.js');
                    util.parseOfficerJSON(client);
                } catch (e) {
                    console.error("Did not find utils.js");
                }
            } else {
                //console.log(JSON.parse(reply)); // used to check if redis database got populated
            }
        }
    });

    client.get("calendar", function(err, reply) {
        if (err) {
            console.error("Error: " + err);
        } else {
            if (reply == null) {
                try {
                    calendarData = require("../metadata/calendar_data.json");
                } catch (ignore) {
                    console.error("Failed to load data from calendar_data.json");
                }
                client.set('calendar', JSON.stringify(calendarData), redis.print);
            } else {
                //console.log(JSON.parse(reply)); // used to check if redis database got populated
            }
        }
    });

    client.get("newsletterdata", function(err, reply) {
        if (err) {
            console.error("Error: " + err);
        } else {
            if (reply == null) {
                try {
                    newsletterdata = require("../metadata/newsletter_data.json");
                } catch (ignore) {
                    console.error("Failed to load data from newsletter_data.json");
                }
                client.set('newsletterdata', JSON.stringify(newsletterdata), redis.print);
            } else {
                //console.log(JSON.parse(reply)); // used to check if redis database got populated
            }
        }
    });

    client.get("revisionNumber", function(err, reply) {
        if (err) {
            console.error("Error: " + err);
        } else {
            if (reply == null) {
                // set the version number on the Redis database
                client.set('revisionNumber', JSON.stringify({
                    revision: revision
                }), redis.print);
            } else {
                //console.log("Revision is: " + revision);
            }

        }
    });

    client.get("announcements", function(err, reply) {
        if (err) {
            console.error("Error: " + err);
        } else {
            if (reply == null) {
                try {
                    announcements = require("../metadata/announcements.json");
                } catch (ignore) {
                    console.error("Failed to load data from announcements.json");
                }
                client.set("announcements", JSON.stringify(announcements), redis.print);
            } else {
                //console.log(JSON.parse(reply));
            }
        }
    });
}
module.exports.onRedisConnection = onRedisConnection;