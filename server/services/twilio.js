const twilio = require('twilio');
const privateCredentials = require('./../lib/credentialsBuilder.js').init();
const { account, authToken, twilioNumber, personalNumber} = privateCredentials.twilio;

const Twilio = (() => {
    let client;

    return {
        initialize: function() {
            console.log("Initializing Twilio");
            client = new twilio(account, authToken);
        },
        sendMessage: function (message) {
            return new Promise((resolve, reject) => {
                if (!client) {
                    return reject("Twilio must be initialized first.");
                } else {
                    return client.messages.create({
                        to: personalNumber,
                        from: twilioNumber,
                        body: message
                    }).then(_ => {
                        return resolve("Twilio message sent!");
                    }).catch(err => {
                        console.error(err);
                        return reject("Error in sending Twiolio message");
                    });
                }
            });
        }
    }
})();

module.exports = Twilio;