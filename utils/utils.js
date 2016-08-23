function parseOfficerJSON(client) {
    var Officer = require('../models/officers.js'),
        officerList = [],
        data = [],
        file = "../metadata/officers.json";

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
        officerList.push(officer);
    }

    for (var i = 0; i < data.chairs.length; i++) {
        var current = data.chairs[i];
        var officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url, current.linkedin);
        officerList.push(officer);
    }

    client.set('officerList', JSON.stringify(officerList)); // put the officerList on the redis database
}

module.exports.parseOfficerJSON = parseOfficerJSON;