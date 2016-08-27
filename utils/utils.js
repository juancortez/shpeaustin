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

    data.executive.forEach(officer => {
        officerList.push(new Officer(officer.name, officer.position, officer.email, officer.phone, officer.hometown, officer.company, officer.executive, officer.image_url, officer.linkedin));
    });

    data.chairs.forEach(officer  => {
        officerList.push(new Officer(officer.name, officer.position, officer.email, officer.phone, officer.hometown, officer.company, officer.executive, officer.image_url, officer.linkedin));
    });

    return callback(false, officerList);
}

module.exports = {
    parseOfficerJSON
}