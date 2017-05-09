function parseOfficerJSON(data = null, cb) {
    const Officer = require('../models/officers.js');

    let officerData = null;
    const officerList = [];

    if(data === null){
        console.log("Loading from backed up officers.json file");;
        const file = "../metadata/officers.json"

        try {
            officerData = require(file);
        } catch (err) {
            console.error("Failed to load data from " + file);
            cb(true, err);
            return;
        }
    } else{
        officerData = data;
        console.log("Parsing data from passed in officers file.");
    }


    try{
        for (let i = 0; i < officerData.executive.length; i++) {
            let current = officerData.executive[i];
            let officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url, current.linkedin);
            officerList.push(officer);
        }

        for (let i = 0; i < officerData.chairs.length; i++) {
            let current = officerData.chairs[i];
            let officer = new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url, current.linkedin);
            officerList.push(officer);
        }
        return cb(false, officerList);
    } catch(e){
        cb(true, e);
    }
}

module.exports.parseOfficerJSON = parseOfficerJSON;