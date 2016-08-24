function parseOfficerJSON(incomingData, callback) {
    var Officer = require('../models/officers.js'),
        officerList = [],
        data = [],
        file = "../metadata/officers.json";
    
    if(!!incomingData){
        data = incomingData;
    } else{
        try {
            //console.log("Loading officer data from " + file);
            data = require(file);
            //console.log("Successfully loaded data from " + file);
        } catch (ignore) {
            return callback({reason: "Failed to load data from " + file});
        }
    }

    var executiveLength = data.executive && data.executive.length || 0,
        chairsLength = data.chairs && data.chairs.length || 0;

    if(!(!!executiveLength) || !(!!chairsLength)){
        return callback({reason: "Incorrect JSON format for Officers."});
    }


    for (var i = 0; i < data.executive.length; i++) {
        var current = data.executive[i];
        var officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url, current.linkedin);
        officerList.push(officer);
    }

    for (var i = 0; i < data.chairs.length; i++) {
        var current = data.chairs[i];
        var officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url, current.linkedin);
        officerList.push(officer);
    }

    return callback(false, officerList);
}

module.exports.parseOfficerJSON = parseOfficerJSON;