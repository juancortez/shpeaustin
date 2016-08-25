/*
* database.js
*
* Created by: Juan Cortez
* Date Created: August 22, 2016
*
* This file serves as a wrapper for the Redis database client. The Database object
* is a Singleton that performs operations on the database through the following exposed
* functions. These functions all update the private cachedData variable so that unnecessary
* calls to the Redis client are prevented.
*
*   create              :   Creates a Singleton Database Object with the Redis client
*   getUUID             :   Gets a unique UUID of the Singleton Object
*   cacheData           :   Caches data, as specified by a key, in a private cachedData variable inside the Database Object.
*   setData             :   Sets data, as specified by a key, into the Redis client and in the cachedData private variable
*   getAllCachedData    :   Returns all data stored inside Redis database
*   getCachedData       :   Gets data, as specified by a key, from the cachedData private variable
*   deleteData          :   Deletes data from the Redis client, as well as the cachedData private variable
*   getKeys             :   Return the keys stored inside the Redis database
*   updateCache         :   Used to update cachedData after a change in the Database
*
*/

var Database = (function() {
    var instance, // Instance stores a reference to the Singleton
        uuid = require('node-uuid');

    // Singleton
    function init(client) {
        var client = client || null,
            uniqueID = uuid.v4(),
            cachedData = {}; // give the Singleton a unique ID

        function _getKeys(callback){
            callback(false, Object.keys(cachedData));
        }

        function _cacheData(key, data, callback, optional) {
            var deleteKey = optional && optional.deleteKey || null,
                sendWebsiteRequest = optional && optional.sendWebsiteRequest || null;

            if(!(!!key)){
                return callback({reason: "Key not provided!"});
            }

            if(!!deleteKey){
                delete cachedData[key];
                console.log("Successfully deleted key: " + key + "!");
                return _sendWebsiteRequest(key, callback);
            }

        	if(typeof data === "string"){
        		// Redis stores JSON as a String, so we need to stringify it
        		//console.log("Converting " + key + " data to an object");
                try{
                    data = JSON.parse(data);
                } catch(e){
                    return callback({reason: "Passed in JSON was not stringified JSON"});
                }
        	} 

            if(typeof data === "object"){
                cachedData[key] = data;
                if(!!sendWebsiteRequest){
                    return _sendWebsiteRequest(key, callback);    
                } 
                return callback(false);
            } else{
                return callback({reason: "Invalid type, must be JSON."});
            }
        }

        function _getAllCachedData(callback){
        	if(Object.keys(cachedData).length === 0 && cachedData.constructor === Object){
        		return callback({reason: "Cached data object is empty."});
        	}
        	callback(false, cachedData); 
        }

        function _getKeysCachedData(keys, callback){
            var response = {},
                length = keys.length;

            if(length === 0){
                return callback({reason: "Array of keys is 0, unable to fetch keys."});
            }

        	for(var i = 0; i < length; i++){
        		var currentKey = keys[i];
        		if(!(!!cachedData[currentKey])){
        			return callback({reason: currentKey + " does not exist in cache. Request failed."});
        		}
        		response[currentKey] =  cachedData[currentKey];
        	}
        	callback(false, response);
        }

        function _getCachedData(key, callback){
        	if(!(!!cachedData[key])){
        		return callback({reason: key + " not found in cache"});
        	}
        	return callback(false, cachedData[key]);
        }

        function _setData(key, data, callback){
            if(!(!!key)){
                return callback({reason: "Key not provided!"});
            }

            if(typeof data === "string"){
                // Redis stores JSON as a String, so we need to stringify it
                try{
                    JSON.parse(data);
                } catch(e){
                    return callback({reason: "Passed in JSON was not stringified JSON"});
                }
                client.set(key, data, function(err, response){
                    if(err){
                        return callback({reason: "Was not able to store " + key + " in Redis database."});
                    }
                    _cacheData(key, data, callback, {
                        deleteKey: false, 
                        sendWebsiteRequest: true
                    });
                }); 
            } else{
                return callback({reason: "Passed in JSON was not stringified JSON"});
            }
        }

        function _deleteData(key, callback){
            if(!(!!cachedData[key])){
                return callback({reason: key + " does not exist in cache. Request failed."});
            }

            _backupKey(key, function(err){
                if(!!err){
                    console.error(err.reason);
                }
                client.del(key, function(err, reply) {
                    if (err) {
                        return callback({reason: "Redis unable to remove " + key});
                    }
                    return _cacheData(key, null, callback, {
                        deleteKey: false, 
                        sendWebsiteRequest: true
                    });
                });
            });
        }

        function _backupKey(key, backupCallback){
            if(!(!!key)){
                return callback({reason: "Key not provided!"});
            }
            var backup = {};
                backup[key] = cachedData[key] || null;

            if(!!backup[key]){
                var path = require("path"),
                    jsonfile = require('jsonfile');

                jsonfile.spaces = 4;
                var file = path.join(__dirname, '../metadata/backup/', key + '_backup.json');
                jsonfile.writeFile(file, backup, function(err) {
                    if(err){
                        return backupCallback({reason: "Unable to backup " + key + ". Request terminated."});
                    }
                    console.log("Backup processed and successfully saved under metadata/backup/" + key + '_backup.json');
                    backupCallback(false);
                });
            }            
        };

        function _updateCache(key, callback){
            if(!(!!key)){
                return callback({reason: "Key not provided!"});
            }

            client.get(key, function(err, data) {
                if (err) {
                    return callback({reason: "Error: " + err});
                } else {
                    if (data == null) {
                        if(cachedData[key]){
                            delete cachedData[key];
                            return callback(false, "Successfully removed " + key + " from cache!");
                        }
                        return callback({reason: key + " does not exist in cache and in the Redis database."});
                    } else {
                        cachedData[key] = JSON.parse(data); // update cache from Redis database
                        return callback(false, "Successfully updated " + key + " from cache!");
                    }
                }
            });
        }

        // if any changes are made locally, make update available to Bluemix, since data is cached
        function _sendWebsiteRequest(key, callback){
            var request = require("request");

            console.log("Sending update to Bluemix website");

            var options = { 
                method: 'POST',
                url: 'http://shpeaustin.mybluemix.net/update/cache',
                headers: { 
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
                body: { 
                    key: key 
                },
                json: true 
            };

            request(options, function (error, response, body) {
                if (error){
                    return callback({reason: error});
                }
                console.log("Successfully updated " +  key + " on Bluemix!");
                return callback(false);
            });
        }

        return {
            getUUID: function() {
                return uniqueID;
            },
            getClient: function(callback) {
                if(!(!!client)){
                    return callback({reason: "Client not defined! Not able to retrieved cached data!"});
                }
                return client;
            },
            getAllCachedData: function(callback) {
	        	if(!(!!client)){
	        		return callback({reason: "Client not defined! Not able to retrieved cached data!"});
	        	}
                _getAllCachedData(callback);
            },
            cacheData: function(key, data, callback){
	        	if(!(!!client)){
	        		return callback({reason: "Client not defined! Not able to cache data!"});
	        	}
            	_cacheData(key, data, callback);
            },
            getKeysCachedData: function(keys, callback){
	        	if(!(!!client)){
	        		return callback({reason: "Client not defined! Not able to retrieved cached data!"});
	        	}   
	        	_getKeysCachedData(keys, callback);   	
            },
            getCachedData: function(key, callback){
	        	if(!(!!client)){
	        		return callback({reason: "Client not defined! Not able to retrieved cached data!"});
	        	}
            	_getCachedData(key, callback);
            },
            setData: function(key, data, callback){
	        	if(!(!!client)){
	        		console.error({reason: "Client not defined! Not able to cache data!"});
	        		return;
	        	}
	        	_setData(key, data, callback);
            }, 
            deleteData: function(key, callback){
                if(!(!!client)){
                    console.error({reason: "Client not defined! Not able to cache data!"});
                    return;
                }
                _deleteData(key, callback);
            },
            getKeys: function(callback){
                if(!(!!client)){
                    console.error({reason: "Client not defined! Not able to view keys!"});
                    return;
                }
                _getKeys(callback);
            },
            updateCache: function(key, callback){
                if(!(!!client)){
                    console.error({reason: "Client not defined! Not able fetch from Redis database!"});
                    return;
                }
                _updateCache(key, callback);
            }
        };
    };

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function(client) {
            if (!instance) {
                instance = init(client);
            }
            return instance;
        }
    };
})();


function create(client, cb) {
    // create a Singleton
    if (!(!!client)) {
        cb({reason: "Invalid Singleton parameters, must supply Redis client!"});
        return;
    }
    var database = Database.getInstance(client);
    //console.log("Retrieved database with instance ID: " + database.getUUID());
    return cb(false);
}

function getUUID() {
    return Database.getInstance().getUUID();
}

/*
	database.getAllCachedData(function(err, data){
		if(!!err){
			console.error(err.reason);
			return;
		}
		console.log(JSON.stringify(data, null, 4));
	});
*/
function getAllCachedData(callback) {
    Database.getInstance().getAllCachedData(callback);
}

/*
    database.cacheData(key, data, function(err){
        if(!!err){
            console.error(err.reason);
            return;
        }
        console.log("Successully cached " + key + " data!");
    });
*/
function cacheData(key, data, callback) {
    if(!(!!key) || !(!!data)){
        return callback({reason: "Key and/or data not provided"});
    }    
    var database = Database.getInstance();
    database.cacheData(key, data, callback);
}

/*
	For a Single Key:
	database.getCachedData(key, function(err, data){
	    if(!!err){
	        console.error(err.reason);
	        return;
	    }
	    console.log(data);
	});

	For an Array of Keys:
	database.getCachedData([key1, key2], function(err, data){
	    if(!!err){
	        console.error(err.reason);
	        return;
	    }
	    console.log(JSON.stringify(data, null, 4));
	});
*/
function getCachedData(key, callback){
	var database = Database.getInstance();
	if(typeof key === "string"){
        if(!(!!key)){
            return callback({reason: "Did not provide key"});
        }
		database.getCachedData(key, callback);
	} else if(key instanceof Array){
        if(key.length === 0){
            return callback({reason: "Empty array."});
        }
		database.getKeysCachedData(key, callback);
	}
}

/*
    database.setData(key, JSON.stringify(data), function(err){
        if(err){
            console.error("Error: " + err.reason);
            return;
        }
        console.log("Successully saved and cached " + key + " to Redis!");
    });
*/
function setData(key, data, callback){
    var database = Database.getInstance();
    if(!(!!key) || !(!!data)){
        return callback({reason: "Key and/or data not provided"});
    }    
    database.setData(key, data, callback);
}

/*
    database.deleteData(key, function(err){
        if(err){
            console.error("Error: " + err.reason);
            return;
        }
        console.log("Successfully removed " + key  + " from database!");
    });
*/
function deleteData(key, callback){
    var database = Database.getInstance();
    if(!(!!key)){
        return callback({reason: "Key not provided"});
    }
    database.deleteData(key, callback);   
}

/*
    Outputs: Array of keys

    database.getKeys(function(err, keys){
        if(err){
            console.error("Error: " + err.reason);
            return;
        }
        console.log("Successfully fetched keys in array format: " + keys);
    });
*/
function getKeys(callback){
    var database = Database.getInstance();
    database.getKeys(callback);   
}

/*
    Outputs: Success String

    database.updateCache(key, function(err, response){
        if(err){
            console.error("Error: " + err.reason);
            return;
        }
        console.log("Successfully updated local cache from Redis database.");
    });
*/
function updateCache(key, callback){
    var database = Database.getInstance();
    database.updateCache(key, callback); 
}

module.exports = {
    create: create,
    getUUID: getUUID,
    cacheData: cacheData,
    setData: setData,
    getAllCachedData: getAllCachedData,
    getCachedData: getCachedData,
    deleteData: deleteData,
    getKeys: getKeys,
    updateCache: updateCache
}



