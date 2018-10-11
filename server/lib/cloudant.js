`
 cloudant.js

 Created by: Juan Cortez
 Date Created: January 25, 2017

 This file serves as a wrapper for the Cloudant database client.

   create              :   Creates a Singleton Database Object with the Cloudant client
`

const Cloudant = (() => {
    const CloudantModule = require('@cloudant/cloudant'),
    database = require("./database.js"),
    config = require('config'),
    dbKeys = config.dbKeys;

	const uuid = require('node-uuid');
	let instance,
		username = "",
		password = "",
        _dbLists = [],
        _shpeDbListName = "shpe_website",
        _docName = "873fbd451ff87e4452d8ce8ba6faffdb";

    function init(args, cb) {
        let uniqueID = uuid.v4(), // give the Singleton a unique ID
        	username = args.username,
        	password = args.password;

        // Initialize the library with my account.
        CloudantModule({account:username, password:password}, function(err, cloudant) {
            if (err) {
                return cb({reason: err});
            } else {
                instance = cloudant;
                return cb(null, cloudant);
            }
        });
    };

    function _prefetchData() {
        console.log("Prefetching database data...");

        const cloudantDatabases = _getDocumentList((err, dbList) => {
            if (err) {
                return console.error(err);
            }

            const shpeDb = _getShpeDatabaseDocument();

            if (!shpeDb) {
                return console.error(`${_shpeDbListName} does not exist on cloudant...`);
            }

            shpeDb.get(_docName, function(err, data) {
                if (err) {
                    return console.error(err);
                }
                _cachePrefetchedData(data);
            });
        });
    }

    function _cachePrefetchedData(data) {
        dbKeys.forEach((key) => {
            let{
                name,
                fileName
            } = key;

            const keyData = data[name] || {};

            database.cacheData(name, keyData, (err) => {
                if (!!err) {
                    console.error(`Error: ${err.reason}`);
                    return;
                }
                console.log(`Successully cached ${name} data!`);
            });
        });
    }

    function _getShpeDatabaseDocument() {
        const shpeWebsiteExists = _dbLists.indexOf(_shpeDbListName) >= 0;

        if (shpeWebsiteExists) {
            return instance.db.use(_shpeDbListName);
        } else {
            return null;
        }
    }

    function _getDocumentList(cb) {
        instance.db.list(function(err, dbList, headers) {
            if (err) {
                return cb({reason: err});
            }

            _dbLists = dbList; // cache list for later use
            return cb(null, dbList);
        });
    }

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: (credentials = null, cb) => {
            if (!credentials) {
                return cb("Must provide credentials to get database instance");
            }

            if (!instance) {
                return init(credentials, cb);
            }
        },
        getDocumentList: (cb) => {
            if (!instance) {
                return cb({reason: "Must instantiate a cloudant instance first, failing gracefuly"});
            }

            return _getDocumentList(cb);
        },
        prefetchData: () => {
            if (!instance) {
                return console.error("Must instantiate a cloudant instance first, failing gracefuly");
            }
            _prefetchData();
        }
    };
})();

`
Creates a Singleton Database Object with Cloudant

@params credentials{Object}    	Object containing username and password

@output callback{Function}      Signature for callback is function(err, data). 
                                If err is truthy, it contains the property, err.reason, describing the error.

`
function init(credentials = null, cb) {
    _checkNumArguments(arguments, 2);

    // create a Singleton
    if (credentials === null) {
        cb({reason: "Must provide credentials to make Cloudant invocation!"});
        return;
    }

    return Cloudant.getInstance(credentials, cb);
}

function getDocumentList(cb) {
    _checkNumArguments(arguments, 1);
    Cloudant.getDocumentList(cb);
}

function prefetchData() {
    Cloudant.prefetchData();
}

`
Checks that the number of arguments matches the number of expected arguments
`
function _checkNumArguments(args, expected) {
    let numArgs = args.length || 0;

    if(numArgs !== expected){
        console.error(`Incorrect number of arguments! Expected ${expected} and got ${numArgs}. Request will hang and will ultimately fail.`);
    }
}

module.exports = {
    init,
    getDocumentList,
    prefetchData
}