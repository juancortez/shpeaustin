function onRedisConnection(client, redis){
	console.log('Connected to Redis');

    // cache metadata files into redis
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
}
module.exports.onRedisConnection = onRedisConnection;