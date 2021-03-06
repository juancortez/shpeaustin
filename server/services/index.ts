/*
    Startup all the different services
*/
const socket = require('socket.io');
const database = require("./../lib/database");
const socket_connect = require("./socket");
const Cloudant = require("./cloudant");
const BlinkApi = require('./blink');
const AugustApi = require('./august');
const HueApi = require('./hue');
const Southwest = require('./southwest').Southwest;
const TwilioApi = require('./twilio');
const SendGridApi = require('./sendGrid');
const mcapi = require('mailchimp-api');
const SettingsProvider = require('./../lib/settingsProvider');
const cloudantCredentials = SettingsProvider.getCredentialByPath(["shpeaustincloudant"]);
const Logger = require('./../lib/logger').createLogger("<ServicesInitializer>");
const TelemetryLogger = require('./../lib/telemetryLogger');
const ReiApi = require('./rei');

module.exports = ((server, app) => {
    _initializeWebSocket(server);
    _initializeCloudant();

    if (!SettingsProvider.isLocalDevelopment()) {
        _initializeMailchimp(app);
        _initializeSmartHome();
        TwilioApi.initialize();
        Southwest.checkFares();
        _initializeReiApi();
    }

    SendGridApi.initialize();
});

/************************************************************************************************************
*                                  Web Socket Configuration
************************************************************************************************************/
function _initializeWebSocket(server) {
    const io = socket.listen(server);
    socket_connect.initiateSocket(io);
}

/************************************************************************************************************
*                                   Cloudant Database Connection
************************************************************************************************************/
function _initializeCloudant() {
    Cloudant.init(cloudantCredentials, (err) => {
        if (err) {
            return Logger.error(err);
        }
        
        database.create(Cloudant, (err) => {
            if(err) {
                return Logger.error(err);
            }
            Logger.log("Database Singleton successfully created!");
    
            Cloudant.prefetchData();

            const FeatureSettings = SettingsProvider.getFeatureSettings();
            FeatureSettings.setDatabase(database);
            TelemetryLogger.getInstance().setDatabase(database);   
            
            const ExpiryEngine = SettingsProvider.getExpiryEngine();
            ExpiryEngine.startExpiryEngine();
        });
    });
}

/************************************************************************************************************
*                                  MailChimp Configuration
* Basic Subscribe Form: https://apidocs.mailchimp.com/api/how-to/basic-subscribe.php
************************************************************************************************************/
function _initializeMailchimp(app) {
    const mc = new mcapi.Mailchimp(SettingsProvider.getCredentialByPath([" mailchimp", "api_key"]));
    app.set('mc', mc);
}

/************************************************************************************************************
*                                  Smart home Configuration
************************************************************************************************************/
function _initializeSmartHome() {
    _initializeBlinkApi();
    _initializeAugustApi();
    _initializeHueApi();
}

/************************************************************************************************************
*                                  Blink Api Configuration
************************************************************************************************************/
function _initializeBlinkApi() {
    const blinkApi = BlinkApi.getInstance();
    blinkApi.initialize().then(async (_) => {
        Logger.log("Blink API successfully initialized");
        blinkApi.synData();
    }).catch(err => {
        Logger.error("Blink API initialization failed");
        Logger.error(err);
    });
}

/************************************************************************************************************
*                                  August Api Configuration
************************************************************************************************************/
function _initializeAugustApi() {
    const augustApi = AugustApi.getInstance();
    augustApi.initialize((err, result) => {
        if (err) {
            return Logger.error("Unable to initialize August API...", err);
        }
        Logger.log("Successfully initialized August API");
    });
}

function _initializeHueApi() {
    HueApi.getInstance();
}

function _initializeReiApi() {
    Logger.log("Initializing REI API...");
    ReiApi.getInstance();
}