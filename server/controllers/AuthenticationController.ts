`
    AuthenticationController.js 
    Endpoint: /authentication

    The following endpoints authenticate users
`
/// <reference path="../router/main.ts" />
namespace Routes {
    const express = require('express'),
        app = express(),
        uuid = require('node-uuid'),
        database = require('../lib/database'),
        Logger = require('./../lib/logger').createLogger("<AuthenticationController>"),
        authorization = require('../lib/authorization').authorization;

    app.post('/login', authorization.webAuth, (req, res) => {
        Logger.log("Login successful!");
        const key = "id";
        const uniqueId = uuid.v4();

        //store all users that have logged in
        database.getCachedData(key, (err, data) => {
            if (err) {
                Logger.error(err);
                return res.status(400).send(`Database error, cannot find ${key} key.`);
            }

            const uniqueIdDb = {
                ts: +new Date(),
                id: uniqueId
            }

            let result = [...data, uniqueIdDb];

            database.setData(key, JSON.stringify(result), (err) => {
                if (err) {
                    Logger.error(`Error: ${err.reason}`);
                    return res.status(400).send(err.reason);
                }

                Logger.log(`${key} data successully set on database!`);
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send({
                    [key]: uniqueId
                });
            });
        });
    });

    module.exports = app;
}