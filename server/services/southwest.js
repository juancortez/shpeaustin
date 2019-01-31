/*
    The following file checks fares at Southwest every hour. If there is a price less than
    specified LOWEST_FARE_PRICE, send an email to buy flight.
*/
const request = require("request");
const TwilioApi = require('./twilio');
const PollEngine = require('./../lib/pollEngine');
const SettingsProvider = require('./../lib/settingsProvider');
const FeatureSettings = SettingsProvider.getFeatureSettings();
const Logger = require('./../lib/logger').createLogger("<Southwest>");
let { intervalCheck: INTERVAL_CHECK = 3600000, lowestFarePrice: LOWEST_FARE_PRICE = 300 } = FeatureSettings.getSetting("southWest");

/* If API Fails more than MAX_FAILURES times, stop invoking API */
let NUM_FAILURES = 0;
const MAX_FAILURES = 5;

function _performSouthwestRequest() {
    const options = {
        method: 'POST',
        url: 'https://www.southwest.com/api/air-booking/v1/air-booking/page/air/booking/shopping',
        headers: {
            'postman-token': 'd511a565-d7e2-2d5d-a5dc-2d4f86b43c54',
            'cache-control': 'no-cache',
            'x-api-key': 'l7xx944d175ea25f4b9c903a583ea82a1c4c',
            'x-channel-id': 'southwest',
            'x-user-experience-id': '62aa51ca-e3f6-4bed-842d-9eb4701c36cf',
            'x-5ku220jw-a': 'xfTKWXcpk3usvf3m=Z7NEfqkWmM4EpR-WyRy5kQBy7iB=PQiJLqCms1N1XRRuPQiWF=8yEP-XGx953qVuIjCkX-uwQxBEBYaWKRGgdoI8eztrLYYWZTM1p1Uwc1Nk8l8N3QW53kfk3js1zD-19MFq3T6wXlirFkj55lPvXHBAfUNyXU6WplNWGxCv_op8fYB5TxF4XlYEpMRWPvPq7--ULICwZQPR3=F1jECE3aR50k6vdxiBfDduPiFW3Cnyw5RyLUdE3gYyfD5ANR-OXVUw71XE0=C1plN1fttWfmm17QFwbDsEG2lWL9CWsR-oV7BWT2a19x6sbljsBDG7ApKzpUJy7UL8jxawZ7-yPOTg9XKvTEu4A=JEL9o53TO1AxVWLkCW1TjJKUUTDyg1ROpWcxBv2vN=fIRgXlNWL7BuZDtyyiOuZ5RvsqBkdq0EdvF7LDs5lZRyQQJvA8uyZ=6k3nR44xYkAQYv3HCvZmpk3ku6G1Yw3q67FTNQCT00oRs0clORkYBWGYD4AxY54R-ZTRJvEbxR3gVkQ76W_pKkfjPok=CWfQFWGq57f7sodikqwxCkEQJw3QB2ulFosvUaGM-EdQF=NciaNlkD0kjWLIs0ZQjvmD-ELgGkPlVwfm7ud=P1LD-vXRgEKUiWsl97VxsEGxK1LeK1XMUWplNvA28EVvX1B-w2KpK5Rl=ELAuyZvYWkxBkp1=ecWaQZYdmG5-uETVwXlCWzLKqemFWLQY53QFyLUVvjqNWAl5DpYLw29p1ZDjrwlkWCQdkZGpyfimWNRRe9=tJLULWLYd=cibWevBkL99Ecli0_xOk-I-WGk-cAxiosAIQZVm59Qd1Msia3xY19vtEYqkW-67595-ufPfuP7yyXlIE38urZxFwdisyZiMEBYkEKxCJVYty2Yk13HkgVkap-cfujHt59qCR9-yy2qPrZHAkDI45cRGyf9avXSp13gY7jqCvbiVWuHFEPqFwPl0apliQbmuuLTBafyCkfsek7g67mHtaBHkqGc5vdlx53j743UY=I=YyZjBE3gNgD6iWPxJ4plOEd7SijE6asRRyPMRQ4ocekYVNPQ65Igimncc=fxJ59xdWMtjg3QiE-C-1blVg3T6vA2aEGxs=NvV=Zi6WfKKWr=P1pcoWplC5cy7gpl6WAR-5zqiuVTNEYH6JGM6WAqF=MtD59l782QiyMatQ09Tk4xcunoT=3TiwXlN=A=FJLsaJL1Fw33Y8AQ8E3ECksQsELuBnLQu1nlNkLC-kG=9HMGx53UikZAma3dVv2=AyNiGkT0Ku2dm4s=6yGzpgETXysu4NslzEf3Kv3Qz5zis=_5gJP6Brc5-QZYI13a-QH8eJLUF=sIFEZuu2RlC8f7CkA8-JYb3k3CjvwxC1fQbvZTF=fPn1plMvNlZvCSp0=xVqDzI07l93XcT5pRRQZHFWzNK53U6EfCNkkAVkdq7afu-oVYzwZHUg3uNWV5swXSm5RlXyj5sQ3==12Tjaf9m5cPgyZkRk9qjkLHV-Xli14qCvZYk0D457V93NPoTwA8sEPxPR9qCWZM-5R6cwZHs13ZK5TQY13IS192759qByPqaWKlP43HFv7dIEVwKrKiBWCUVvLDGEf8dydk8CfTBoL5gkA86EdA38u6tEjmpeTqi=AkBWfTBpVxiWfHB5INKyfk65TkFwT=BkDjVk4o9gzlM49AcWmYYmmHN20=BWfxlE3kfkdquWr9pEcTY53Ap5piIvGQMvplByZiMyGYowAk-k3HkaCzIkGxCvucdq8667KlFe9xYv3YQ=pR-vZ1jE_5je3IgyuRNuMxik9ls8NK-udkBgelj498FQj=7qRlB5czm5pgPEMzcR3I-J3iF0RIgod=u5zdTWKYBgNaRE3kCEfeR=VIR10pKRplbEGkgus8svZqFETx6uZ1B5pUP1Zku7qy-oLkgHA=M=3Tz1k5myZHs1psmWGlYW2=KvXl9yC1Q8NRe4EQiE98-yZQCvR',
            'referer': 'https://www.southwest.com/air/booking/select.html?originationAirportCode=FLL&destinationAirportCode=SEA&returnAirportCode=&departureDate=2019-03-24&departureTimeOfDay=ALL_DAY&returnDate=&returnTimeOfDay=ALL_DAY&adultPassengersCount=1&seniorPassengersCount=0&fareType=USD&passengerType=ADULT&tripType=oneway&promoCode=&reset=true&redirectToVision=true&int=HOMEQBOMAIR&leapfrogRequest=true',
            'content-type': 'application/json'
        },
        body: {
            originationAirportCode: 'FLL',
            destinationAirportCode: 'SEA',
            returnAirportCode: '',
            departureDate: '2019-03-24',
            departureTimeOfDay: 'ALL_DAY',
            returnDate: '',
            returnTimeOfDay: 'ALL_DAY',
            adultPassengersCount: '1',
            seniorPassengersCount: '0',
            fareType: 'USD',
            passengerType: 'ADULT',
            tripType: 'oneway',
            promoCode: '',
            reset: 'true',
            redirectToVision: 'true',
            int: 'HOMEQBOMAIR',
            leapfrogRequest: 'true',
            application: 'air-booking',
            site: 'southwest'
        },
        json: true
    };

    _checkFeatureSettingUpdates();
    
    request(options, function (error, response, body) {
      if (error) {
          Logger.error("Invalid request ", error);
          NUM_FAILURES++;
          return;
      }

      _findLowestPrice(body);
    });
}

function _checkFeatureSettingUpdates() {
    const southWestSettings = FeatureSettings.getSetting("southWest") || null;

    if (southWestSettings) {
        INTERVAL_CHECK = southWestSettings.intervalCheck || INTERVAL_CHECK;
        LOWEST_FARE_PRICE = southWestSettings.lowestFarePrice || LOWEST_FARE_PRICE;
    }
}

function _findLowestPrice(result) {
    if (result && result.success) {
        const searchResults = result.data && result.data.searchResults ? result.data.searchResults : null;
        const fareSummary = searchResults && searchResults.fareSummary ? searchResults.fareSummary : [];
        const currentLowestPrice = _getLowestPrice(fareSummary);

        if (currentLowestPrice <= LOWEST_FARE_PRICE) {
            _sendNotification(currentLowestPrice);
            return;
        } else {
            Logger.error("Fare not found for value under " + LOWEST_FARE_PRICE);
            return;
        }
    }
}

function _getLowestPrice(fareSummary) {
    return fareSummary.reduce((acc, fare) => {
        const minimumFare = fare && fare.minimumFare && fare.minimumFare.value ? fare.minimumFare.value : Infinity;
        return Math.min(acc, minimumFare);
    }, Infinity);
}

function _sendNotification(currentLowestPrice) {
    const msg = `A cheaper Southwest flight has been found for ${currentLowestPrice}.`;
    TwilioApi.sendMessage(msg);
}

function _pollSouthwest() {
    if (NUM_FAILURES >= MAX_FAILURES) {
        return;
    }

    _performSouthwestRequest();
    setTimeout(_pollSouthwest, INTERVAL_CHECK);
}

module.exports.Southwest = {
    checkFares: function() {
        const southWestPollEngine = new PollEngine({
            fn: _pollSouthwest,
            pollMs: INTERVAL_CHECK,
            pollEngineName: "SouthwestPollEngine"
        });
        southWestPollEngine.startPolling();
    }
}