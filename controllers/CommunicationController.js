`
    CommunicationController.js 
    Endpoint: /communication

    The following endpoints utilize Slack-bot and SendGrid to send outgoing data
`

const express = require('express'),
    app = express(),
    config = require('config'),
    database = require('../lib/database.js'),
    privateCredentials = require('../private_credentials/credentials.json');

app.post('/contact', function(req, res) {
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
        sendGridEmail = config.sendGrid.sendGridEmail;

    let {
        name,
        phone,
        email,
        category,
        message,
        subscribe
    } = body;

    let messageSent = `Name:${name}, Phone Number: ${phone}, E-mail Address: ${email}, Subject: ${category}, Message: ${message}.`;

    console.log(`Sending the following message to: ${sendGridEmail}`);
    console.log(messageSent);

    if (subscribe) {
        /* Incoming WebHook using botland*/
        // https://api.slack.com/incoming-webhooks
        bot.sendWebhook({
            text: `Please add the following email address ${email} to the newsletter.`
        }, (err, res) => {
            if (err) {
                console.error(`Webhook error: ${err}`);
            }
            console.log('Incoming webhook result: ${res}');
        });
    }

    sendgrid.send({
        to: sendGridEmail,
        from: email,
        subject: 'SHPE Austin Website Message',
        text: messageSent,
        html: `<b>Name:</b> ${name} <br> <b>Phone number:</b> ${phone} <br><b>E-mail address:</b>${email}<br><b> Category:</b>${category}<br><b>Message:</b>${message}`
    }, (err, json) => {
        if (err) {
            console.error(err);
            return res.sendStatus(400);
        }
        console.log(`E-mail sent successfully. ${JSON.stringify(json)} \nSent to: ${sendGridEmail}`);
        return res.sendStatus(200);
    });
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

module.exports = app;