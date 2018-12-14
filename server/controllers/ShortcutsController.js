const express = require('express'),
    app = express();

// TODO: re-write middleware for shortcuts
const middleware = require('./../middleware/HackathonMiddleware');

/*
    Convert Decimal Degrees to Degrees Minutes Seconds (DMS)

    /shortcuts/coordinates?longitude=-13.12&latitude=45.65

    Example result:
        {
            "latitude": "-13 degrees, 7 minutes, 11 seconds",
            "longitude": "45 degrees, 38 minutes, 59 seconds"
        }    
*/
app.get('/coordinates', middleware.blinkAuth, (req, res) => {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
        return res.status(400).send("Must provide latitude and longitude query parameters");
    }

    // Convert to numbers
    const latitudeQuery = +latitude;
    const longitudeQuery = +longitude;

    if (!latitudeQuery || !longitudeQuery) {
        return res.status(400).send("Latitude and longitude values are not valid numbers.");
    }

    try {
        const latitudeResult = _calculateDegreesMinutesSeconds(longitudeQuery);
        const longtitudeResult = _calculateDegreesMinutesSeconds(latitudeQuery);
        const readableLatitude = _convertToReadable(latitudeResult);
        const readableLongtitude = _convertToReadable(longtitudeResult);

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            "latitude": readableLatitude,
            "longitude": readableLongtitude
        });
    } catch(e) {
        return res.status(500).send("Invalid latitude and longitude values");
    }
});

/*
    Will convert from decimal degrees to DMS

    Example response:
        {
            "decimal": 42,
            "minutes": 6,
            "seconds": 30
        }
*/
function _calculateDegreesMinutesSeconds(input) {
    const decimalWholeNum = _getWholeNumber(input);

    const inputDecimal = Math.abs(_getDecimal(input));
    const inputMinutes = inputDecimal * 60;
    const inputMinutesWholeNum = _getWholeNumber(inputMinutes);

    const inputMinutesDecimal = _getDecimal(inputMinutes);
    const inputSeconds = inputMinutesDecimal * 60;
    const inputSecondsWholeNum = _getWholeNumber(inputSeconds);

    return {
        "decimal": decimalWholeNum,
        "minutes": inputMinutesWholeNum,
        "seconds": inputSecondsWholeNum
    };
}

/*
    Convert to an example such as:
        42 degrees, 21 minutes, 36 seconds
*/
function _convertToReadable(input) {
    const { decimal, minutes, seconds } = input;
    return `${decimal} degrees, ${minutes} minutes, ${seconds} seconds`
}

function _getWholeNumber(num) {
    return num > 0 ? Math.floor(num) : Math.ceil(num);
}

function _getDecimal(num) {
    return num % 1;
}

module.exports = app;