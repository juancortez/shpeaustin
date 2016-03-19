/*
* The onRedisConnection function gets called when redis has connected. The purpose of this
* file is to cache all files under the /metadata folder for faster web browsing loading times.
*
* The data cached by this file gets called by the main.js router file.
*
*/
var clearRedisDatabase = require('../models/globals.js').clearRedisDatabase; // set flag to true to clear database
var revision = require('../models/globals.js').revision;
var newRevision = require('../models/globals.js').newRevision;

function onRedisConnection(client, redis){
	console.log('Connected to Redis');
	var keys = ["officerList", "calendarData", "newsletterdata"]; // keys that exist on the database

    // cache metadata files into redis
    if(!clearRedisDatabase){
    	client.get("officerList", function (err, reply) {
		    if (err){
		    	console.error("Error: " + err);
		    } else{
		    	if(reply == null){
		    		try{
					    util = require('../utils/utils.js');
					    util.parseOfficerJSON(client, redis); 
					} catch(e){
					    console.error("Did not find utils.js");
					}
		    	} else{
		    		//console.log(JSON.parse(reply)); // used to check if redis database got populated
		    	}
		    }
		});

		client.get("calendarData", function (err, reply){
			if (err){
				console.error("Error: " + err);
			} else{
				if(reply == null){
					try {
			            calendarData = require("../metadata/calendar_data.json");
			        } catch (ignore) {
			            console.error("Failed to load data from calendar_data.json");
			        }
			        client.set('calendarData', JSON.stringify(calendarData), redis.print);
				} else{
					//console.log(JSON.parse(reply)); // used to check if redis database got populated
				}
			}
		});

		client.get("newsletterdata", function (err, reply){
			if (err){
				console.error("Error: " + err);
			} else{
				if(reply == null){
					try {
			            newsletterdata = require("../metadata/newsletter_data.json");
			        } catch (ignore) {
			            console.error("Failed to load data from newsletter_data.json");
			        }
			        client.set('newsletterdata', JSON.stringify(newsletterdata), redis.print);
				} else{
					//console.log(JSON.parse(reply)); // used to check if redis database got populated
				}
			}
		});

		client.get("revisionNumber", function(err, reply){
			if(err){
				console.error("Error: " + err);
			} else{
				if(reply == null){
					// set the version number on the Redis database
					client.set('revisionNumber', revision, redis.print);
				} else{
					//console.log("Revision is: " + revision);
				}
				
			}
		});
    }
    
	if(clearRedisDatabase){
		keys.forEach(function(key){
		  	client.del(key, function(err, reply) {
		  		if(err){
		  			console.error(err);
		  		}
		  		if(reply == 1){
		  			console.log("Database cleared");
		  		}
			});
		});
	}

	if(newRevision){
		client.set('revisionNumber', revision, redis.print);
	}

}
module.exports.onRedisConnection = onRedisConnection;