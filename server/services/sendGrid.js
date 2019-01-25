const sgMail = require('@sendgrid/mail');
const config = require('config');
const privateCredentials = require('../lib/credentialsBuilder.js').init();
const { apiKey } = privateCredentials.sendGrid;
const Logger = require('./../lib/logger').createLogger("<SendGrid>");

const SendGrid = (() => {
    let _initialized = false;
    let _defaultFrom = config.sendGrid.sendGridEmail;
    let _defaultSubject = "SHPE Austin Message";

    return {
        initialize: function() {
            if (!_initialized) {
                Logger.log("Initializing SendGrid mail API");
                sgMail.setApiKey(apiKey);
            }
            _initialized = true;
        },
        sendMessage: function (message) {
            return new Promise((resolve, reject) => {
                if (!_initialized) {
                    const err = "Must initialize SendGrid before sending a message";
                    Logger.error(err);
                    return reject(err);
                }
                const {
                    to,
                    from = _defaultFrom,
                    bcc,
                    subject = _defaultSubject,
                    text
                } = message;

                if (!text || !to) {
                    const err = "Required parameters for send message not provided";
                    Logger.error(err);
                    return reject(err);
                }

                const html = message.html || text;

                const msg = {
                    to,
                    from,
                    bcc,
                    subject,
                    text,
                    html
                  };

                  sgMail.send(msg)
                    .then(_ => {
                        Logger.log(`Message to ${to} successfully sent`);
                        return resolve();
                    }).catch(err => {
                        Logger.error(err);
                        return reject(err);
                    });
            });
        }
    }
})();

module.exports = SendGrid;