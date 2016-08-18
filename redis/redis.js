/*
 * The onRedisConnection function gets called when redis has connected. The purpose of this
 * file is to cache all files under the /metadata folder for faster web browsing loading times.
 *
 * The data cached by this file gets called by the main.js router file.
 *
 */

var config = require('config'),
    clearRedisDatabase = config.redis.clearRedisDatabase, // set flag to true to clear database
    revision = config.revision,
    backup = {},
    itemsProcessed = 0,
    deleteKeys = [], 
    redisKeys = config.redis.keys;
var deleteKeys = Object.keys(redisKeys).filter(function(key){ // keys to be deleted from the database
    if(redisKeys[key] === true){
        return true;
    }
    return false;
});

function onRedisConnection(client, redis) {
    console.log('Connected to Redis');

    //cache metadata files into redis
    if (!clearRedisDatabase) {
        client.get("officerList", function(err, reply) {
            if (err) {
                console.error("Error: " + err);
            } else {
                if (reply == null) {
                    try {
                        util = require('../utils/utils.js');
                        util.parseOfficerJSON(client, redis);
                    } catch (e) {
                        console.error("Did not find utils.js");
                    }
                } else {
                    //console.log(JSON.parse(reply)); // used to check if redis database got populated
                }
            }
        });

        client.get("calendarData", function(err, reply) {
            if (err) {
                console.error("Error: " + err);
            } else {
                if (reply == null) {
                    try {
                        calendarData = require("../metadata/calendar_data.json");
                    } catch (ignore) {
                        console.error("Failed to load data from calendar_data.json");
                    }
                    client.set('calendarData', JSON.stringify(calendarData), redis.print);
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
                    client.set('revisionNumber', revision, redis.print);
                } else {
                    client.set('revisionNumber', revision);
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


    if (clearRedisDatabase) {
        deleteKeys.forEach(function(key) {
            client.get(key, function(err, reply) {
                if (err) {
                    console.error(err);
                } else {
                    backup[key] = JSON.parse(reply);
                    // when the database is cleared, it also saves a backup just in case it was accidental. It saves it in /metadata/backup.json
                }
                itemsProcessed++;
                if (itemsProcessed === deleteKeys.length) {
                    _backupRedisOnClear();
                }
            });
            client.del(key, function(err, reply) {
                if (err) {
                    console.error(err);
                }
                if (reply == 1) {
                    console.log("Successfully delete key: " + key);
                }
            });
        });
        console.log("The following keys in the database were cleared: " + deleteKeys);
    }

    // Save a backup of all Redis database and place it in /metadata/backup.json
    function _backupRedisOnClear() {
        console.log("Backup processed and successfully saved");
        var path = require("path");
        var jsonfile = require('jsonfile');
        jsonfile.spaces = 4;
        var file = path.join(__dirname, '../metadata', 'backup.json');
        jsonfile.writeFile(file, backup, function(err) {
            console.error(err);
        });
    }
}
module.exports.onRedisConnection = onRedisConnection;