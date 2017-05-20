`
    The onRedisConnection function gets called when redis has connected. The purpose of this
    file is to cache all files under the /metadata folder for faster web browsing loading times.

    The data cached by this file gets called by the main.js router file.
`


const config = require('config'),
    database = require("../lib/database.js"),
    revision = config.revision,
    redisKeys = config.redisKeys,
    cfenv = require('cfenv'),
    request = require('request'),
    exporter = require('../lib/exporter.js'),
    appEnv = cfenv.getAppEnv(),
    port = appEnv.port,
    baseUrl = appEnv.isLocal ? config.get('app.local') + port : config.get('app.deployed');

function onRedisConnection(client) {
    console.log('Connected to Redis');

    redisKeys.forEach((key) => {
        let{
            name, 
            fileName
        } = key;

        let data;
        client.get(name, (err, reply) => {
            if(err) return console.error(`Erro: ${err}`);
            if(reply === null){
                try{
                    if(name === "mailchimp") _getMailChimpData((err, result) => {
                        if(err) return console.error(err);
                        return _setData({
                            name, 
                            data: JSON.stringify(result)
                        });
                    });
                    else data = require(`../metadata/${fileName}`);
                } catch (ignore) {
                    return console.error(`Failed to load data from ${fileName}, exiting`);
                }
                if(name === "mailchimp") return;
                return _setData({
                    name, 
                    data
                });
            } else{
                _cacheData(name, reply);
                if(/calendar|jobs|announcements|newsletter|googleForm|mailchimp/.test(name)){
                    _updateMetadata(`${fileName}`, reply);
                }  
            }
        });
    });
}

// make a request to mailchimp to get data
function _getMailChimpData(cb){
    request({
        method: "GET",
        url: `${baseUrl}/communication/mailchimp/lists`
        }, (error, response, body) => {
            if(error) return cb(error);  
            else cb(false, JSON.parse(body)); 
    }); 
}

// set the data to the database
function _setData({name, data}){
    database.setData(name, JSON.stringify(data), (err) => {
        if(err) return console.error(`Error: ${err.reason}`);
        console.log(`Successfully saved and cached ${name} data!`);
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