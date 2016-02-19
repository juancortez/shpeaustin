function parseOfficerJSON() {
    var Officer = require('../models/officers.js');
    var officerList = require('../models/globals.js').officerList;
    var executiveOfficerList = require('../models/globals.js').executiveOfficerList;

    var data = [];
    var file = "../metadata/officers.json"

    try {
        //console.log("Loading officer data from " + file);
        data = require(file);
        //console.log("Successfully loaded data from " + file);
    } catch (ignore) {
        console.error("Failed to load data from " + file);
    }

    for (var i = 0; i < data.executive.length; i++) {
        var current = data.executive[i];
        var officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url, current.linkedin);
        executiveOfficerList.push(officer);
    }

    for (var i = 0; i < data.chairs.length; i++) {
        var current = data.chairs[i];
        var officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url, current.linkedin);
        officerList.push(officer);
    }
}

module.exports.parseOfficerJSON = parseOfficerJSON;