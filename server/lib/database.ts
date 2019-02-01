`
 database.js

 Created by: Juan Cortez
 Date Created: August 22, 2016

 This file serves as a wrapper for any database client. The Database object
 is a Singleton that performs operations on the database through the following exposed
 functions. These functions all update the private cachedData variable so that unnecessary
 calls to the database client are prevented.

   create              :   Creates a Singleton Database Object with any generic database client
   getUUID             :   Gets a unique UUID of the Singleton Object
   cacheData           :   Caches data, as specified by a key, in a private cachedData variable inside the Database Object.
   setData             :   Sets data, as specified by a key, into the database client and in the cachedData private variable
   getAllCachedData    :   Returns all data stored inside the database
   getCachedData       :   Gets data, as specified by a key, from the cachedData private variable
   deleteData          :   Deletes data from the dabase client, as well as the cachedData private variable
   getKeys             :   Return the keys stored inside the database
   updateCache         :   Used to update cachedData after a change in the Database
`
namespace DatabaseWrapper {
    const Logger = require('./logger').createLogger("<Database>");

    const Database = (() => {
        const uuid = require('node-uuid'),
            utils = require('./utils'),
            exporter = require('./exporter.js');
        let instance; // Instance stores a reference to the Singleton
    
        // Singleton
        function init(db) {
            const client = db,
                uniqueID = uuid.v4(); // give the Singleton a unique ID
            let cachedData = {};
    
            function _getKeys(callback){
                callback(false, Object.keys(cachedData));
            }
    
            function _getData(key, callback) {
                if(!key) {
                    return callback({
                        reason: "Key not provided!"
                    });
                }
    
                client.get(key, (err, data) => {
                    if (err) {
                        Logger.error(`Unable to retrieve ${key} key from database`);
                        return callback(err);
                    }
    
                    _cacheData(key, data);
    
                    return callback(null, data);
                });
            }
    
            function _cacheData(key = null, data = "", callback?) {
                if(!key) {
                    return callback({
                        reason: "Key not provided!"
                    });
                }
    
                _verifyIsObject(data, (err, result) => {
                    if (err) {
                        Logger.error(err);
                        return callback({
                            reason: "Invalid type, must be JSON."
                        });
                    }
    
                    cachedData[key] = result;
                });
            }
    
            function _getAllCachedData(callback){
                if (utils.isEmptyObject(cachedData)) {
                    return callback({reason: "Cached data object is empty."});
                }
    
                callback(false, cachedData); 
            }
    
            function _getKeysCachedData(keys = [], callback){
                let response = {},
                    length = keys.length;
    
                if(length === 0){
                    return callback({
                        reason: "Array of keys is 0, unable to fetch keys."
                    });
                }
    
                for(let i = 0; i < length; i++){
                    let currentKey = keys[i];
                    if(!cachedData[currentKey]) {
                        return callback({
                            reason: `${currentKey} does not exist in cache. Request failed.`
                        });
                    }
    
                    response[currentKey] =  cachedData[currentKey];
                }
    
                callback(false, response);
            }
    
            function _getCachedData(key = null, callback){
                if (!cachedData[key]) {
                    return callback({
                        reason: `${key} not found in cache`
                    });
                }
    
                return callback(false, cachedData[key]);
            }
    
            function _setData(key = null, data, callback) {
                if (!key || !data) {
                    const reason = `Unable to set data without both a key and data field.`;
                    Logger.error(reason);
                    return callback({
                        reason
                    });
                }
    
                Logger.info(`Setting data for ${key}`);
    
                _verifyIsObject(data, (err, result) => {
                    if (err) {
                        Logger.error(err);
                        return callback({
                            reason: err
                        });
                    }
    
                    client.set(key, result, (err) => {
                        if(err) {
                            Logger.error(`Was not able to set database key, ${key}`);
                            return callback({
                                reason: `Was not able to store ${key} in database.`
                            });
                        }
    
                        _cacheData(key, result);
    
                        Logger.log(`Successfully set database key, ${key}`);
                        return callback(null);
                    }); 
                });
            }
    
            function _deleteData(key = null, callback){
                if (!cachedData[key]){
                    return callback({reason: `${key} does not exist in cache. Request failed.`});
                }
    
                _backupKey(key, (err) =>{
                    if(!!err){
                        Logger.error(err.reason);
                    }
    
                    client.del(key, (err) => {
                        if (err) {
                            return callback({reason: `Unable to remove ${key}`});
                        }
    
                        delete cachedData[key];
                        return callback(null);
                    });
                });
            }
    
            function _backupKey(key = null, backupCallback){
                if(!(!!key)){
                    return backupCallback({reason: "Key not provided!"});
                }
                let backup = {};
                    backup[key] = cachedData[key] || null;
    
                if(!!backup[key]){
                    const path = require("path"),
                        destination = path.join(__dirname, `../metadata/backup/${key}_backup.json`);
    
                    exporter.save.json({
                        destination,
                        filename: `${key}_backup.json`,
                        data: backup,
                        cb: (err, data) => {
                            if(err){
                                return backupCallback({reason: `Unable to backup ${key}. Request terminated.`});
                            }
                            backupCallback(false);
                        }
                    });
    
                }
            };
    
            function _updateCache(key = null, callback){
                if(!key){
                    return callback({
                        reason: "Key not provided!"
                    });
                }
    
                client.get(key, (err, data) => {
                    if (err) {
                        return callback({
                            reason: `Error: ${err}`
                        });
                    } else {
                        if (data == null) {
                            if (cachedData[key]){
                                delete cachedData[key];
                                return callback(false, `Successfully removed ${key} from cache!`);
                            }
    
                            return callback({
                                reason: `${key} does not exist in cache and in the database.`
                            });
                        } else {
                            cachedData[key] = data;
                            return callback(false, `Successfully updated ${key} from cache!`);
                        }
                    }
                });
            }
    
            function _verifyIsObject(obj, cb) {
                if (utils.isObject(obj)) {
                    return cb(null, obj);
                } else if (typeof obj === "string") {
                    try {
                        obj = JSON.parse(obj);
                    } catch(e) {
                        return cb({
                            reason: "Object was not valid JSON, invalid format."
                        });
                    }
    
                    return cb(null, obj);
                } else {
                    return cb({
                        reason: "Invalid format for data"
                    });
                }
            }
    
            return {
                getUUID() {
                    return uniqueID;
                },
                getClient(callback) {
                    if(!(!!client)){
                        return callback({reason: "Client not defined! Not able to retrieved cached data!"});
                    }
                    return client;
                },
                getAllCachedData(callback) {
                    if(!(!!client)){
                        return callback({reason: "Client not defined! Not able to retrieved cached data!"});
                    }
                    _getAllCachedData(callback);
                },
                cacheData(key, data, callback){
                    if(!(!!client)){
                        return callback({reason: "Client not defined! Not able to cache data!"});
                    }
                    _cacheData(key, data, callback);
                },
                getKeysCachedData(keys, callback){
                    if(!(!!client)){
                        return callback({reason: "Client not defined! Not able to retrieved cached data!"});
                    }   
                    _getKeysCachedData(keys, callback);   	
                },
                getCachedData(key, callback){
                    if(!(!!client)){
                        return callback({reason: "Client not defined! Not able to retrieved cached data!"});
                    }
                    _getCachedData(key, callback);
                },
                setData(key, data, callback){
                    if(!(!!client)){
                        Logger.error({reason: "Client not defined! Not able to cache data!"});
                        return;
                    }
                    _setData(key, data, callback);
                }, 
                deleteData(key, callback){
                    if(!(!!client)){
                        Logger.error({reason: "Client not defined! Not able to cache data!"});
                        return;
                    }
                    _deleteData(key, callback);
                },
                getKeys(callback){
                    if(!(!!client)){
                        Logger.error({reason: "Client not defined! Not able to view keys!"});
                        return;
                    }
                    _getKeys(callback);
                },
                updateCache(key, callback){
                    if(!(!!client)){
                        Logger.error({reason: "Client not defined! Not able fetch from database!"});
                        return;
                    }
                    _updateCache(key, callback);
                },
                getData(key, callback) {
                    if(!client){
                        Logger.error({reason: "Client not defined! Not able fetch from database!"});
                        return;
                    }
                    _getData(key, callback);
                }
            };
        };
    
        return {
            // Get the Singleton instance if one exists
            // or create one if it doesn't
            getInstance: (db?) => {
                if (!instance) {
                    instance = init(db);
                }
                return instance;
            }
        };
    })();
    
    `
        Creates a Singleton Database Object
    
        @params database{Object}       The database object, created by instantiating the Database client.
    
        @output callback{Function}      Signature for callback is function(err, data). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
    
    `
    export function create(db = null, cb) {
        _checkNumArguments(arguments, 2);
        // create a Singleton
        if (!(!!db)) {
            cb({reason: "Invalid Singleton parameters, must supply Database client!"});
            return;
        }
        const dbInstance = Database.getInstance(db);
        return cb(false, dbInstance);
    }
    
    `
        Gets a unique UUID of the Singleton Object
    `
    export function getUUID() {
        return Database.getInstance().getUUID();
    }
    
    `
        Returns all data stored inside Redis database
    
        @output callback{Function}      Signature for callback is function(err, data). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
                                        If data is truthy, it contains all data in database, as stringified JSON data
    
        database.getAllCachedData(function(err, data){
            if(!!err){
                Logger.error(err.reason);
                return;
            }
            Logger.log(JSON.stringify(data, null, 4));
        });
    `
    export function getAllCachedData(callback) {
        _checkNumArguments(arguments, 1);
        Database.getInstance().getAllCachedData(callback);
    }
    
    `
        Caches data, as specified by a key, in a private cachedData variable inside the Database Object.
    
        @params key{String}             Key to be stored            
        @params data{String}            Stringified JSON            
    
        @output callback{Function}      Signature for callback is function(err). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
    
        database.cacheData(key, data, function(err){
            if(!!err){
                Logger.error(err.reason);
                return;
            }
            Logger.log("Successully cached " + key + " data!");
        });
    `
    export function cacheData(key = null, data = "", callback) {
        _checkNumArguments(arguments, 3);
        if(!(!!key) || !(!!data)){
            return callback({reason: "Key and/or data not provided"});
        }    
        var database = Database.getInstance();
        if (!database) {
            return Logger.error("Database not instantiated, unable to cache data.");
        }
        database.cacheData(key, data, callback);
    }
    
    `
        Gets data, as specified by a key, from the cachedData private variable
    
        @params key{String || Array}    Key(String) OR Keys(Array) to be retrieved
         
        @output callback{Function}      Signature for callback is function(err, data). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
                                        If data is truthy, it contains the JSON stringified data, with the input key being the key to access the data
    
        For a Single Key:
        database.getCachedData(key, function(err, data){
            if(!!err){
                Logger.error(err.reason);
                return;
            }
            Logger.log(data);
        });
    
        For an Array of Keys:
        database.getCachedData([key1, key2], function(err, data){
            if(!!err){
                Logger.error(err.reason);
                return;
            }
            Logger.log(JSON.stringify(data, null, 4));
        });
    `
    export function getCachedData(key = null, callback){
        _checkNumArguments(arguments, 2);
    
        const database = Database.getInstance();
    
        if (!key) {
            return callback({reason: "Did not provide key"});
        }
    
        if(typeof key === "string"){
            if (!key) {
                return callback({
                    reason: "Did not provide key"
                });
            }
    
            database.getCachedData(key, callback);
        } else if (key instanceof Array){
            if(key.length === 0){
                return callback({
                    reason: "Empty array."
                });
            }
            database.getKeysCachedData(key, callback);
        }
    }
    
    `
        Sets data, as specified by a key, into the Redis client and in the cachedData private variable
    
        @params key{String}             The key that is to be stored on the Redis database
        @params data{String}            The data associated with the key, sent in as stringified JSON
         
        @output callback{Function}      Signature for callback is function(err). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
    
        database.setData(key, JSON.stringify(data), function(err){
            if(err){
                Logger.error("Error: " + err.reason);
                return;
            }
            Logger.log("Successully saved and cached " + key + " to Redis!");
        });
    `
    export function setData(key = null, data = "", callback){
        _checkNumArguments(arguments, 3);
        var database = Database.getInstance();
        if(!(!!key) || !(!!data)){
            return callback({reason: "Key and/or data not provided"});
        }    
        database.setData(key, data, callback);
    }
    
    `
        Deletes data from the Redis client, as well as the cachedData private variable
    
        @params key{String}             The key that is to be removed from the Redis database
         
        @output callback{Function}      Signature for callback is function(err). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
    
        database.deleteData(key, function(err){
            if(err){
                Logger.error("Error: " + err.reason);
                return;
            }
            Logger.log("Successfully removed " + key  + " from database!");
        });
    `
    export function deleteData(key = null, callback){
        _checkNumArguments(arguments, 2);
        var database = Database.getInstance();
        if(!(!!key)){
            return callback({reason: "Key not provided"});
        }
        database.deleteData(key, callback);   
    }
    
    `
        Return the keys stored inside the Redis database
    
        @output callback{Function}      Signature for callback is function(err, keys). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
                                        If keys is truthy, it contains an array of keys available in the Redis database
    
        database.getKeys(function(err, keys){
            if(err){
                Logger.error("Error: " + err.reason);
                return;
            }
            Logger.log("Successfully fetched keys in array format: " + keys);
        });
    `
    export function getKeys(callback){
        _checkNumArguments(arguments, 1);
        var database = Database.getInstance();
        database.getKeys(callback);   
    }
    
    `
        Used to update cachedData after a change in the Database
    
        @params key{String}             The key that is to be updated from the Redis database after a database change has occurred. 
    
        @output callback{Function}      Signature for callback is function(err, response). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
                                        If response is truthy, it contains a success message with the key that was updated
    
        database.updateCache(key, function(err, response){
            if(err){
                Logger.error("Error: " + err.reason);
                return;
            }
            Logger.log("Successfully updated local cache from Redis database.");
        });
    `
    export function updateCache(key = null, callback){
        _checkNumArguments(arguments, 2);
        var database = Database.getInstance();
        database.updateCache(key, callback); 
    }
    
    `
        Retrieves data from database
    
        @params key{String}             The key to fetch
    
        @output callback{Function}      Signature for callback is function(err, response). 
                                        If err is truthy, it contains the property, err.reason, describing the error.
                                        If response is truthy, the response includes the data
    
        database.getData(key, function(err, response){
            if(err){
                Logger.error("Error: " + err.reason);
                return;
            }
            Logger.log("Successfully retrieved data.");
        });
    `
    export function getData(key, callback) {
        _checkNumArguments(arguments, 2);
        var database = Database.getInstance();
        database.getData(key, callback); 
    }
    
    `
        Checks that the number of arguments matches the number of expected arguments
    `
    function _checkNumArguments(args, expected){
        let numArgs = args.length || 0;
    
        if(numArgs !== expected){
            Logger.error(`Incorrect number of arguments! Expected ${expected} and got ${numArgs}. Request will hang and will ultimately fail.`);
        }
    }
}

module.exports = {
    create: DatabaseWrapper.create,
    getUUID: DatabaseWrapper.getUUID,
    cacheData: DatabaseWrapper.cacheData,
    setData: DatabaseWrapper.setData,
    getData: DatabaseWrapper.getData,
    getAllCachedData: DatabaseWrapper.getAllCachedData,
    getCachedData: DatabaseWrapper.getCachedData,
    deleteData: DatabaseWrapper.deleteData,
    getKeys: DatabaseWrapper.getKeys,
    updateCache: DatabaseWrapper.updateCache
}