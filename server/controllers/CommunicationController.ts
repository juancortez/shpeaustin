`
    CommunicationController.js 
    Endpoint: /communication

    The following endpoints utilize Slack-bot and SendGrid to send outgoing data
`
/// <reference path="../router/main.ts" />
namespace Routes {
    const express = require('express'),
        app = express(),
        config = require('config'),
        database = require('../lib/database.js'),
        SettingsProvider = require('../lib/settingsProvider'),
        Logger = require('./../lib/logger').createLogger("<CommunicationController>"),
        SendGridApi = require('./../services/sendGrid');

    const sendGridEmail = config.sendGrid.sendGridEmail,
        sendGridEmailBcc = config.sendGrid.sendGridEmailBcc;

    app.post('/contact', (req, res) => {
        let body = req.body || null;

        if (!body) {
            return res.status(400).send("Body is empty, invalid request");
        }

        let {
            name = "SHPE-BOT",
            phone = "",
            email = sendGridEmail,
            subject = "SHPE Austin Website Message",
            message = "",
            subscribe = false
        } = body;

        let messageSent;

        if (subscribe) {
            messageSent = `Please add the following email address ${email} to the newsletter.`;
        } else {
            messageSent = `Name:${name}, Phone Number: ${phone}, E-mail Address: ${email}, Subject: ${subject}, Message: ${message}.`;;
        }

        Logger.log(`Sending the following message to: ${sendGridEmail}: ${messageSent}`);
        
        SendGridApi.sendMessage({
            to: sendGridEmail,
            bcc: sendGridEmailBcc,
            from: email,
            subject,
            text: messageSent,
            html: `<b>Name:</b> ${name} <br> <b>Phone number:</b> ${phone} <br><b>E-mail address:</b>${email}<br><b> Subject:</b>${subject}<br><b>Message:</b>${message}`
        }).then( _ => {
            let success = `E-mail sent successfully. \nSent to: ${sendGridEmail}`;
            return res.status(200).send(success);
        }).catch(err => {
            Logger.error(err);
            return res.sendStatus(400);
        });
    });

    // Outgoing Webhook provided by the SHPE Austin Bot
    app.post('/bot/officers', (req, res) => {
        Logger.log("Slackbot message received!");
        const botToken = SettingsProvider.getCredentialByPath(["slack", "outgoingToken"]);
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
                    if (!!err) Logger.error(`Error: ${err.reason}`);
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
            Logger.log(`Successfully subscribed ${req.body.email}!`);
            res.sendStatus(200);
        }, (error) => {
            Logger.error(error);
            res.status(400).send('There was an error subscribing that user');
        });
    });


    module.exports = app;
}