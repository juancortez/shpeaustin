const twilio = require('twilio');
const SettingsProvider = require('./../lib/settingsProvider');
const sendGridCredentials = SettingsProvider.getCredentialByPath(["twilio"]) || {};
const { account, authToken, twilioNumber, personalNumber} = sendGridCredentials;
const Logger = require('./../lib/logger').createLogger("<Twilio>");

const Twilio = (() => {
    let client;

    return {
        initialize: function() {
            if (!client) {
                Logger.log("Initializing Twilio");
                client = new twilio(account, authToken);
            }
            return client;
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
                        Logger.error(err);
                        return reject("Error in sending Twiolio message");
                    });
                }
            });
        }
    }
})();

module.exports = Twilio;