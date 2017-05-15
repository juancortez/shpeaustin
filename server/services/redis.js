`
    The onRedisConnection function gets called when redis has connected. The purpose of this
    file is to cache all files under the /metadata folder for faster web browsing loading times.

    The data cached by this file gets called by the main.js router file.
`


const config = require('config'),
    database = require("../lib/database.js"),
    revision = config.revision,
    cfenv = require('cfenv'),
    request = require('request'),
    exporter = require('../lib/exporter.js'),
    appEnv = cfenv.getAppEnv();

function onRedisConnection(client) {
    console.log('Connected to Redis');

    //cache metadata files into redis
    client.get("officerList", (err, reply) => {
        let fileName = "officers.json";
        let officerData;
        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                try {
                    officerData = require(`../metadata/${fileName}`);
                } catch (ignore) {
                    console.error(`Failed to load data from ${fileName}, exiting`);
                    return;
                }

                database.setData("officerList", JSON.stringify(officerData), (err) => {
                    if (err) {
                        console.error(`Error: ${err.reason}`);
                        return;
                    }
                    console.log("Successully saved and cached officerList to Redis!");
                });

            } else {
                _cacheData("officerList", reply);
            }
        }
    });

    client.get("calendar", (err, reply) => {
        let fileName = "calendar_data.json";
        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                try {
                    calendarData = require(`../metadata/${fileName}`);
                } catch (ignore) {
                    console.error(`Failed to load data from ${fileName}, exiting`);
                    return;
                }
                database.setData("calendar", JSON.stringify(calendarData), (err) => {
                    if (err) {
                        console.error(`Error: ${err.reason}`);
                        return;
                    }
                    console.log("Successully saved and cached calendar to Redis!");
                });
            } else {
                _cacheData("calendar", reply);
                _updateMetadata(`${fileName}`, reply);
            }
        }
    });

    client.get("jobs", (err, reply) => {
        let fileName = "jobs.json";
        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                try {
                    jobData = require(`../metadata/${fileName}`);
                } catch (ignore) {
                    console.error(`Failed to load data from ${fileName}, exiting`);
                    return;
                }
                database.setData("jobs", JSON.stringify(jobData), (err) => {
                    if (err) {
                        console.error(`Error: ${err.reason}`);
                        return;
                    }
                    console.log("Successully saved and cached jobs to Redis!");
                });
            } else {
                _cacheData("jobs", reply);
                _updateMetadata(`${fileName}`, reply);
            }
        }
    });

    client.get("revisionNumber", (err, reply) => {
        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                // set the version number on the Redis database
                database.setData("revisionNumber", JSON.stringify({
                    revision: revision
                }), (err) => {
                    if (err) {
                        console.error(`Error: ${err.reason}`);
                        return;
                    }
                    console.log("Successully saved and cached revisionNumber to Redis!");
                });
            } else {
                _cacheData("revisionNumber", reply);
            }

        }
    });

    client.get("announcements", (err, reply) => {
        let fileName = "announcements.json";
        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                try {
                    announcements = require(`../metadata/${fileName}`);
                } catch (ignore) {
                    console.error(`Failed to load data from ${fileName}`);
                }
                database.setData("announcements", JSON.stringify(announcements), (err) => {
                    if (err) {
                        console.error(`Error: ${err.reason}`);
                        return;
                    }
                    console.log("Successully saved and cached announcements to Redis!");
                });
            } else {
                _cacheData("announcements", reply);
                _updateMetadata(`${fileName}`, reply);
            }
        }
    });

    client.get("id", (err, reply) => {
        let fileName = "id.json";
        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                // no id's provided
            } else {
                _cacheData("id", reply);
                _updateMetadata(`${fileName}`, reply);
            }
        }
    });


    client.get("mailchimp", (err, reply) => {
        let fileName = "mailchimp.json",
            key = "mailchimp";

        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                const baseUrl = appEnv.isLocal ? config.get('app.local') : config.get('app.deployed');
                request({
                    method: "GET",
                    url: `${baseUrl}/communication/mailchimp/lists`
                    }, (error, response, body) => {
                    if (error) return console.error(error);

                    database.setData(key, body, (err) => {
                        if (err) {
                            console.error(`Error: ${err.reason}`);
                            return;
                        }
                        console.log(`Successully saved and cached ${key} to Redis!`);
                    });
                });
            } else {
                _cacheData(key, reply);
                _updateMetadata(`${fileName}`, reply);
            }
        }
    });

    client.get("googleForm", (err, reply) => {
        let fileName = "google_form.json",
            key = "googleForm";
        var googleForm;

        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                try {
                    googleForm = require(`../metadata/${fileName}`);
                } catch (ignore) {
                    return console.error(`Failed to load data from ${fileName}`);
                }
                database.setData(`${key}`, JSON.stringify(googleForm), (err) => {
                    if (err) {
                        console.error(`Error: ${err.reason}`);
                        return;
                    }
                    console.log(`Successully saved and cached ${key} to Redis!`);
                });
            } else {
                _cacheData(key, reply);
                _updateMetadata(`${fileName}`, reply);
            }
        }
    });

    client.get("newsletter", (err, reply) => {
        let fileName = "newsletter.json",
            key = "newsletter";
        var newsletter;

        if (err) {
            console.error(`Error: ${err}`);
        } else {
            if (reply == null) {
                try {
                    newsletter = require(`../metadata/${fileName}`);
                } catch (ignore) {
                    return console.error(`Failed to load data from ${fileName}`);
                }
                database.setData(`${key}`, JSON.stringify(newsletter), (err) => {
                    if (err) {
                        console.error(`Error: ${err.reason}`);
                        return;
                    }
                    console.log(`Successully saved and cached ${key} to Redis!`);
                });
            } else {
                _cacheData(key, reply);
                _updateMetadata(`${fileName}`, reply);
            }
        }
    });
}

// cache data on local memory for faster retrival times
function _cacheData(key, data) {
    if (_checkNumArguments(arguments, 2) === false) return;
    database.cacheData(key, data, (err) => {
        if (!!err) {
            console.error(`Error: ${err.reason}`);
            return;
        }
        console.log(`Successully cached ${key} data!`);
    });
}

// Function used to update the metadata file to match what is on the Redis database on launch
function _updateMetadata(filename, data) {
    if (_checkNumArguments(arguments, 2) === false) return;

    const path = require("path"),
        destination = path.join(__dirname, '../metadata', filename);

    exporter.save.json({
        destination,
        filename: `${filename}`,
        data: JSON.parse(data),
        cb: (err, data) => {
            if (!!err) return console.error(err.reason);
        }
    });
}

// verifies that the function got the correct number of arguments
function _checkNumArguments(args, expected) {
    let numArgs = args.length || 0;

    if (numArgs !== expected) {
        console.error(`Incorrect number of arguments! Expected ${expected} and got ${numArgs}.`);
        return false;
    }
    return true;
}

module.exports = {
    onRedisConnection
}