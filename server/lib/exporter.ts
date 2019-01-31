`
exporter.js

 Created by: Juan Cortez
 Date Created: September 21, 2016

This file exports data and saves it to the local disk. This module currenty supports saving JSON.

	Example of an invocation

	const exporter = require('../lib/exporter.js');
	exporter.save.json({
	    destination,
	    filename: "calendar_data.json",
	    data,
	    cb: (err, data) => {
	        if(err){
	            return console.error(err.reason);
	        }
	        console.log(data);
	    }
	});
`
namespace FileExporter {
	const Logger = require('./logger').createLogger("<Exporter>");
	const jsonfile = require('jsonfile');
	jsonfile.spaces = 4;
	
	export const save = (function(){
		return{
			json(args){
				let{
					destination,
					filename,
					data,
					cb
				} = args;
	
				if(!destination || !data || !cb){
					return Logger.error("Insufficient parameters passed, saving failed.");
				}
	
				jsonfile.writeFile(destination, data, (err) => {
					if(err){
						return cb({reason: "Unable to write file." + err});
					}
					Logger.log(`Successfully saved ${filename ? filename + " ": ""}data under the ${destination} directory.`);
					cb(false, data);
				});
			}
		}
	})();
}

module.exports = {
	save: FileExporter.save
}