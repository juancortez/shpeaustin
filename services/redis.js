/*
 * The onRedisConnection function gets called when redis has connected. The purpose of this
 * file is to cache all files under the /metadata folder for faster web browsing loading times.
 *
 * The data cached by this file gets called by the main.js router file.
 *
 */

var config = require('config'),
    database = require("../lib/database.js"),
    revision = config.revision;

function onRedisConnection(client) {
    console.log('Connected to Redis');

    //cache metadata files into redis
    client.get("officerList", function(err, reply) {
        if (err) {
            console.error("Error: " + err);
        } else {
            if (reply == null) {
                try {
                    var util = require('../utils/utils.js');
                } catch (e) {
                    console.error("Did not find utils.js");
                }

                util.parseOfficerJSON(null, function(err, data){
                    if(!!err){
                        console.error(err.reason);
                        return;
                    }
                    database.setData("officerList", JSON.stringify(data), function(err){
                        if(err){
                            console.error("Error: " + err.reason);
                            return;
                        }
                        console.log("Successully saved and cached officerList to Redis!");
                    });
                });
            
            } else {
                cacheData("officerList", reply);
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
                database.setData("calendar", JSON.stringify(calendarData), function(err){
                    if(err){
                        console.error("Error: " + err.reason);
                        return;
                    }
                    console.log("Successully saved and cached calendar to Redis!");
                });
            } else {
                cacheData("calendar", reply);
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
                database.setData("newsletterdata", JSON.stringify(newsletterdata), function(err){
                    if(err){
                        console.error("Error: " + err.reason);
                        return;
                    }
                    console.log("Successully saved and cached newsletterdata to Redis!");
                });
            } else {
                cacheData("newsletterdata", reply);
            }
        }
    });

    client.get("revisionNumber", function(err, reply) {
        if (err) {
            console.error("Error: " + err);
        } else {
            if (reply == null) {
                // set the version number on the Redis database
                database.setData("revisionNumber", JSON.stringify({revision: revision}), function(err){
                    if(err){
                        console.error("Error: " + err.reason);
                        return;
                    }
                    console.log("Successully saved and cached revisionNumber to Redis!");
                });
            } else {
                cacheData("revisionNumber", reply);
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
                database.setData("announcements", JSON.stringify(announcements), function(err){
                    if(err){
                        console.error("Error: " + err.reason);
                        return;
                    }
                    console.log("Successully saved and cached announcements to Redis!");
                });
            } else {
                cacheData("announcements", reply);
            }
        }
    });

    client.get("id", function(err, reply) {
        if (err) {
            console.error("Error: " + err);
        } else {
            if (reply == null) {
               // no id's provided
            } else {
                cacheData("id", reply);
            }
        }
    });
}

function cacheData(key, data){
    database.cacheData(key, data, function(err){
        if(!!err){
            console.error(err.reason);
            return;
        }
        console.log("Successully cached " + key + " data!");
    });
}
module.exports.onRedisConnection = onRedisConnection;