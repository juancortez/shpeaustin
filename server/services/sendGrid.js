const sgMail = require('@sendgrid/mail');
const config = require('config');
const privateCredentials = require('../lib/credentialsBuilder.js').init();
const { apiKey } = privateCredentials.sendGrid;

const SendGrid = (() => {
    let _initialized = false;
    let _preLog = "<SendGrid>"
    let _defaultFrom = config.sendGrid.sendGridEmail;
    let _defaultSubject = "SHPE Austin Message";

    function _log(msg) {
        console.log(`${_preLog}: ${msg}`);
    }

    function _error(msg) {
        console.error(`${_preLog}: ${msg}`);
    }

    return {
        initialize: function() {
            if (!_initialized) {
                _log("Initializing SendGrid mail API");
                sgMail.setApiKey(apiKey);
            }
            _initialized = true;
        },
        sendMessage: function (message) {
            return new Promise((resolve, reject) => {
                if (!_initialized) {
                    const err = "Must initialize SendGrid before sending a message";
                    _error(err);
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
                    _error(err);
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
                        _log(`Message to ${to} successfully sent`);
                        return resolve();
                    }).catch(err => {
                        _error(err);
                        return reject(err);
                    });
            });
        }
    }
})();

module.exports = SendGrid;