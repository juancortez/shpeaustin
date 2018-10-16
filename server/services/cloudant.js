`
 cloudant.js

 Created by: Juan Cortez
 Date Created: January 25, 2017

 This file serves as a wrapper for the Cloudant database client.

   create              :   Creates a Singleton Database Object with the Cloudant client
`

const Cloudant = (() => {
    const CloudantModule = require('@cloudant/cloudant'),
    database = require("./../lib/database.js"),
    config = require('config'),
    dbKeys = config.dbKeys;

    const uuid = require('node-uuid');
    let instance,
        username = "",
        password = "",
        _shpeDbListName = "shpe_website",
        _shpeDb,
        _shpeDbInstancePromise,
        _cachedRevId = {};

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
                _setShpeDatabaseInstance(); // point to the SHPE Database
                return cb(null, cloudant);
            }
        });
    };

    function _get(key, cb) {
        if (!_shpeDb) {
            return cb({reason: "Shpe database has not been initialized, unable to get from Cloudant"});
        }

        const cloudantId = _findCloundantId(key);

        if (!cloudantId) {
            return cb({reason: `Unable to find cloudantId for ${key} database key.`});
        }

        _shpeDb.get(cloudantId, function(err, data) {
            if (err) {
                return cb({reason: err});
            }

            const keyData = data[key] || null;

            if (!keyData) {
                return cb({reason: `Data for ${key} not found.`})
            }

            _cacheRevId(key, data._rev);

            return cb(null, keyData);
        });
    }

    function _set(key, data, cb) {
        if (!_shpeDb) {
            return cb({reason: "Shpe database has not been initialized, unable to get from Cloudant"});
        }

        const cloudantId = _findCloundantId(key);

        if (!cloudantId) {
            return cb({reason: `Unable to find cloudantId for ${key} database key.`});
        }

        _shpeDb.insert({
            [key]: data,
            "_id": cloudantId,
            "_rev": _cachedRevId[key]
        }, cloudantId, function(err, doc) {
            if(err) {
               return cb({reason: err});
            }
            console.log(`Successully set ${key} key for SHPE database`);
            _cacheRevId(key, data._rev);

            return cb(null);
         });
    }

    function _prefetchData() {
        _shpeDbInstancePromise.then(_ => {
            dbKeys.forEach((key) => {
                let{
                    name
                } = key;

                _get(name, (err, keyData) => {
                    if (err) {
                        return console.error(err);
                    }

                    database.cacheData(name, keyData, (err) => {
                        if (err) {
                            console.error(`Error: ${err.reason}`);
                            return;
                        }
                        console.log(`Successully cached ${name} data!`);
                    });
                });
            });
        }).catch(err => {
            console.error("Unable to prefetch data since SHPE Database was not set ", err);
        });
    }

    function _cacheRevId(id, revId) {
        Object.assign(_cachedRevId, {
            [id]: revId
        });
    }

    function _findCloundantId(key) {
        const matchingKey = dbKeys.find(currentKey => currentKey.name === key) || null;

        if (matchingKey) {
            const cloudantId = matchingKey.cloudantId || null;
            return cloudantId;
        } else {
            return null;
        }
    }

    function _setShpeDatabaseInstance() {
        _shpeDbInstancePromise = new Promise((resolve, reject) => {
            _getShpeDatabaseDocument((err) => {
                if (err) {
                    return reject(err);
                }

                _shpeDb = instance.db.use(_shpeDbListName);
                return resolve("SHPE Database set");
            });
        })
    }

    function _getShpeDatabaseDocument(cb) {
        instance.db.list(function(err, dbList, headers) {
            if (err) {
                return cb({reason: err});
            }

            const shpeDbExists = dbList.indexOf(_shpeDbListName) >= 0;

            if (!shpeDbExists) {
                return cb({reason: "Shpe database does not exist...exiting gracefully"});
            }

            return cb(null);
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
        get: (key, cb) => {
            if (!instance) {
                return cb({reason: "Must instantiate a cloudant instance first, failing gracefuly"});
            }

            return _get(key, cb);
        },
        set: (key, data, cb) => {
            if (!instance) {
                return cb({reason: "Must instantiate a cloudant instance first, failing gracefuly"});
            }

            return _set(key, data, cb);
        },
        prefetchData: () => {
            if (!instance) {
                return console.error("Must instantiate a cloudant instance first, failing gracefuly");
            }
            return _prefetchData();
        }
    };
})();

`
Creates a Singleton Database Object with Cloudant

@params credentials{Object}     Object containing username and password

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

function prefetchData() {
    Cloudant.prefetchData();
}

function get(key, cb) {
    _checkNumArguments(arguments, 2);

    return Cloudant.get(key, cb);
}

function set(key, data, cb) {
    _checkNumArguments(arguments, 3);

    return Cloudant.set(key, data, cb);
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
    get,
    set,
    prefetchData
}