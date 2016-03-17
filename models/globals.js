// @utilizedIn	utils/utils.js
// Contains all officer data used to populate the Officers.ejs page
exports.officerList = []; // list of chairs

// @utilizedIn	redis/redis.js
// Setting the variable to true clears the Redis database after each run
exports.clearRedisDatabase = false; // set flag to true if you want to delete all data on redis database

// @utilizedIn	 router/main.js. 
// The following e-mail is the recipient of e-mails sent in the Contact Us page.
exports.sendGridEmail = "cortezjuanjr@gmail.com";

