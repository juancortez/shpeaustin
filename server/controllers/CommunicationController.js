`
    CommunicationController.js 
    Endpoint: /communication

    The following endpoints utilize Slack-bot and SendGrid to send outgoing data
`

const express = require('express'),
    app = express(),
    config = require('config'),
    database = require('../lib/database.js'),
    privateCredentials = require('../lib/credentialsBuilder.js').init();

app.post('/contact', (req, res) => {
    const bot = req.app.get('bot');
    let body = req.body || null;

    if (!(!!body)) {
        return res.status(400).send("Body is empty, invalid request");
    }

    if (process.env.VCAP_SERVICES) {
        var env = JSON.parse(process.env.VCAP_SERVICES);
        var credentials = env['sendgrid'][0].credentials;
    } else {
        var credentials = privateCredentials.sendgrid.credentials;
    }

    //sendgrid documentation and attaching to bluemix: https://github.com/sendgrid/reseller-docs/tree/master/IBM
    const sendgrid = require('sendgrid')(credentials.username, credentials.password),
        sendGridEmail = config.sendGrid.sendGridEmail,
        sendGridEmailBcc = config.sendGrid.sendGridEmailBcc;

    let {
        name,
        phone,
        email,
        category,
        message,
        subscribe
    } = body;

    if (subscribe) {
        /* Incoming WebHook using botland*/
        // https://api.slack.com/incoming-webhooks
        bot.sendWebhook({
            text: `Please add the following email address ${email} to the newsletter.`
        }, (err, res) => {
            if (err) {
                console.error(`Webhook error: ${err}`);
                return res.sendStatus(400);
            }
            console.log('Incoming webhook result: ${res}');
            return res.sendStatus(200);
        });
    } else {
        let messageSent = `Name:${name}, Phone Number: ${phone}, E-mail Address: ${email}, Subject: ${category}, Message: ${message}.`;

        console.log(`Sending the following message to: ${sendGridEmail}: ${messageSent}`);
        
        let emailPromise = new Promise((resolve, reject) => {
            sendgrid.send({
                to: sendGridEmail,
                bcc: sendGridEmailBcc,
                from: email,
                subject: 'SHPE Austin Website Message',
                text: messageSent,
                html: `<b>Name:</b> ${name} <br> <b>Phone number:</b> ${phone} <br><b>E-mail address:</b>${email}<br><b> Category:</b>${category}<br><b>Message:</b>${message}`
            }, (err, json) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                let success = `E-mail sent successfully. ${JSON.stringify(json)} \nSent to: ${sendGridEmail}`;
                return resolve(success);
            });
        });

        let slackPromise = new Promise((resolve, reject) => {
            bot.sendWebhook({
                "attachments": [
                    {
                        "fallback": messageSent,
                        "color": "#36a64f",
                        "pretext": "New message received from SHPE Website",
                        "author_name": `Sent by: ${name}`,
                        "fields": [
                            {
                                "title": "Subject",
                                "value": category,
                                "short": false
                            },
                            {
                                "title": "Phone Number",
                                "value": phone,
                                "short": false
                            },
                            {
                                "title": "E-Mail",
                                "value": email,
                                "short": false
                            },
                            {
                                "title": "Message",
                                "value": message,
                                "short": false
                            }
                        ],
                        "footer": "SHPE Austin Website",
                        "ts": new Date().getTime()
                    }
                ]
            }, (err, result) => {
                if (err) {
                    let webhookErr = `Webhook error: ${err}`;
                    return reject(webhookErr);
                }
                return resolve(`Incoming webhook result: ${result}`);
            });
        });

        Promise.all([emailPromise, slackPromise]).then(values => { 
            console.log(values);
            return res.sendStatus(200);
        }, reason => {
            console.error(reason);
            return res.sendStatus(400);
        });  
    }
});

// Outgoing Webhook provided by the SHPE Austin Bot
app.post('/bot/officers', (req, res) => {
    console.log("Slackbot message received!");
    const botToken = privateCredentials.slack.outgoingToken;
    let outgoingHook = req.body,
        triggerWord = outgoingHook && outgoingHook.trigger_word && outgoingHook.trigger_word.toLocaleLowerCase() || "";

    if (botToken != outgoingHook.token) {
        return res.sendStatus(401);
    }

    let unsupportedCommand = "Sorry, outgoing webhook not yet supported. Please contact your webmaster.";
    if (triggerWord === "who is") {
        let officerSearch = outgoingHook.text.toLocaleLowerCase();
        officerSearch = officerSearch.replace("who is ", "");

        database.getCachedData("officerList", (err, officerList) => {
            if (!!err || !(!!officerList)) {
                if (!!err) console.error(`Error: ${err.reason}`);
                return res.send({
                    "text": "Sorry, I was not able to find any officer data. Please contact your webmaster."
                });
            }

            // filter all officers and find the officer that they are looking for
            let officerFound = officerList.filter((officer) => {
                var currentOfficer = officer.name.toLocaleLowerCase();
                if (currentOfficer.indexOf(officerSearch) != -1) {
                    return true;
                }
            });
            try {
                let similarNames;
                if (officerFound.length > 1) {
                    similarNames = true;
                    throw similarNames;
                } else if (officerFound.length == 0) {
                    similarNames = false;
                    throw similarNames;
                }
                officerFound = officerFound[0];
            } catch (similarNames) {
                res.send({
                    "text": `Sorry, I was not able to find ${officerSearch}${similarNames ? ". There were multiple matches, please be more specific." : "."}`
                });
                return;
            }

            let {
                name,
                position,
                email,
                phone
            } = officerFound;

            let result = `I found ${name}!\nTheir position in SHPE Austin is ${position}.\nIf you would like to contact this individual, you can either contact them via e-mail at ${email} or via phone at ${phone}.`;

            res.send({
                'text': result
            });
        });
    } else {
        res.send({
            "text": unsupportedCommand
        });
        return;
    }
});


/*
 * Return the SHPE Austin List
 */
app.get('/mailchimp/lists', (req, res) => {
    const mc = req.app.get('mc'); // mail-chimp handler
    mc.lists.list({}, (data) => {
        let shpeList = data.data.find((list) => list.default_from_name === "SHPE Austin");
        res.json(shpeList);
    });
});

/*
 * POST subscribe an email to a list.
 */
app.post('/mailchimp/lists/:id/subscribe', (req, res) => {
    const mc = req.app.get('mc'); // mail-chimp handler
    mc.lists.subscribe({
        id: req.params.id,
        email: {
            email: req.body.email
        }
    }, (data) => {
        console.log(`Successfully subscribed ${req.body.email}!`);
        res.sendStatus(200);
    }, (error) => {
        console.error(error);
        res.status(400).send('There was an error subscribing that user');
    });
});


module.exports = app;