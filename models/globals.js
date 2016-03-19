// @utilizedIn	utils/utils.js
// Contains all officer data used to populate the Officers.ejs page
exports.officerList = []; // list of chairs

// @utilizedIn	redis/redis.js
// Setting the variable to true clears the Redis database after each run
exports.clearRedisDatabase = false; // set flag to true if you want to delete all data on redis database

// @utilizedIn	 router/main.js. 
// The following e-mail is the recipient of e-mails sent in the Contact Us page.
exports.sendGridEmail = "cortezjuanjr@gmail.com";

// @utliziedIn 	 redis/redis.js
// 				 views/* - The variable is used to un-cache data for stylesheets and javascript files in case of updates
/* Solves the following problem:
 * If you add a query string after the name of the .css file (for example, main.css?v=1), 
 * then a web browser will see the file as main.css?v=1 and not just main.css. 
 * If you change the number after the v= whenever you change the external style sheet, then browsers consider 
 * that a new file and will download the external style sheet from the web server instead of using the cached site.
 */
exports.revision = 1; // Revision 1 as of March 18, 2016 @ 16:28
