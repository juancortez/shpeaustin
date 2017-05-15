`
 cloudant.js

 Created by: Juan Cortez
 Date Created: January 25, 2017

 This file serves as a wrapper for the Cloudant database client.

   create              :   Creates a Singleton Database Object with the Redis client
`


const Cloudant = (() => {
	const uuid = require('node-uuid');
	let instance,
		username = "",
		password = "";

    function init(args) {
        let uniqueID = uuid.v4(), // give the Singleton a unique ID
        	username = args.username,
        	password = args.password;

        function _getCommand(args){

        }

        function _postCommand(args){
        	
        }

        function _putCommand(args){
        	
        }

        function _deleteCommand(args){
        	
        }

    	function _sendToCloudant(method, document, data, callback){
    		console.log("Sending request to Cloudant...");
    	}

        return {
            execute(args) {
            	let{
            		method,
            		document,
            		data,
            		callback
            	} = args;

            	if(method === "GET") return _getCommand(args);
            	if(method === "POST") return _postCommand(args);
            	if(method === "PUT") return _putCommand(args);
            	if(method === "DELETE") return _deleteCommand(args);
            	else console.error(`${method} not supported.`);
            }
        }
    };

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: (credentials = null) => {
            if (!instance) {
                instance = init(credentials);
            }
            return instance;
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
    let database = Cloudant.getInstance(credentials);
    return cb(false);
}

function execute(args){
	let database = Cloudant.getInstance();
	return database.execute(args);
}

`
Checks that the number of arguments matches the number of expected arguments
`
function _checkNumArguments(args, expected){
    let numArgs = args.length || 0;

    if(numArgs !== expected){
        console.error(`Incorrect number of arguments! Expected ${expected} and got ${numArgs}. Request will hang and will ultimately fail.`);
    }
}

module.exports = {
    init,
    execute
}