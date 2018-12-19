`
    Author: Juan Cortez

    This node.js application serves both the client and server side of the SHPE Austin Website (austinshpe.org).

    When running locally without Docker, run the following:
        $npm start
    When running locally with Docker, run the following:
        In one tab: $chmod 777 docker/redis_start.sh && ./docker/redis_start.sh
        In another tab: $npm start
    Deploying application to Bluemix:
        $cf push

`

const express = require('express'),
    app = express(),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    isLocal = appEnv.isLocal,
    bodyParser = require('body-parser'),
    fs = require('fs'),
    request = require('request'),
    favicon = require('serve-favicon'),
    router = express.Router(),
    compression = require('compression'),
    privateCredentials = require('./lib/credentialsBuilder.js').init(),
    cloudantCredentials = privateCredentials.shpeaustincloudant,
    slackCredentials = privateCredentials.slack,
    socket_connect = require("./services/socket.js"),
    socket = require('socket.io'),
    config = require('config'),
    runDocker = config.docker.run,
    database = require("./lib/database.js"),
    Cloudant = require("./services/cloudant.js"),
    BlinkApi = require('./services/blink'),
    mcapi = require('mailchimp-api'),
    AugustApi = require('./services/august'),
    path = require('path');

const root = path.join(__dirname + '/../'),
    staticRoot = path.join(__dirname + '/../public/');


/************************************************************************************************************
*                                   Cloudant Database Connection
************************************************************************************************************/
Cloudant.init(cloudantCredentials, (err, cloudantDb) => {
    if (err) {
        return console.error(err);
    }
    
    database.create(Cloudant, (err, dbInstance) => {
        if(err) {
            return console.error(err);
        }
        console.log("Database Singleton successfully created!");

        Cloudant.prefetchData();
    });
});

/***********************************************************************************************************
*                                  Express App Configuration
***********************************************************************************************************/
app.use(compression()); //use compression 
app.use(express.static(staticRoot, { maxAge: 604800000 /* 7d */ })); // 1d = 86400000
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(favicon(staticRoot + '/assets/shpe_austin_icon.png'));

app.use('/', express.static(root + '/dist'));
app.use('/scripts', express.static(root + '/node_modules'));

if (isLocal) {
    app.get('/playground/react', function(req, res) {
        return res.sendFile(path.join(staticRoot + '/views/react.html'), {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
    });
}

require('./router/main')(app, express); // adds the main.js file to send response to browser

// start server on the specified port and binding host
const server = app.listen(appEnv.port, () => {
    console.log(`Server starting on ${appEnv.url}`);
});

/************************************************************************************************************
*                                  Web Socket Configuration
************************************************************************************************************/
const io = socket.listen(server);
socket_connect.initiateSocket(io);

/************************************************************************************************************
*                                  MailChimp Configuration
* Basic Subscribe Form: https://apidocs.mailchimp.com/api/how-to/basic-subscribe.php
************************************************************************************************************/
const mc = new mcapi.Mailchimp(privateCredentials.mailchimp.api_key);
app.set('mc', mc);

/************************************************************************************************************
*                                  Blink Api Configuration
************************************************************************************************************/
const blinkApi = BlinkApi.getInstance();
blinkApi.initialize().then(async (_) => {
    console.log("Blink API successfully initialized");
    blinkApi.synData();
}).catch(err => {
    console.error("Blink API initialization failed");
    console.error(err);
});

/************************************************************************************************************
*                                  August Api Configuration
************************************************************************************************************/
const augustApi = AugustApi.getInstance();
augustApi.initialize((err, result) => {
    if (err) {
        return console.error("Unable to initialize August API...", err);
    }
    console.log("Successfully initialized August API");
});