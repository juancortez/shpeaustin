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
    redis = require('redis'),
    router = express.Router(),
    compression = require('compression'),
    privateCredentials = require('./lib/credentialsBuilder.js').init(),
    redisCredentials = privateCredentials.redis.credentials,
    slackCredentials = privateCredentials.slack,
    redis_connect = require("./services/redis.js"),
    socket_connect = require("./services/socket.js"),
    socket = require('socket.io'),
    config = require('config'),
    runDocker = config.docker.run,
    database = require("./lib/database.js"),
    cloudant = require("./lib/cloudant.js"),
    mcapi = require('mailchimp-api'),
    path = require('path');

const root = path.join(__dirname + '/../'),
    staticRoot = path.join(__dirname + '/../public/');

/************************************************************************************************************
*                           Configuration Updates for Local vs Non-Local
************************************************************************************************************/
if(isLocal){
    const _console = require("./lib/console.js");
    if(runDocker){
        redisCredentials.port = config.redis.local.port;
        redisCredentials.hostname = config.redis.local.hostname;
    }
} else{
    redisCredentials.port = config.redis.deployed.port;
    redisCredentials.hostname = config.redis.deployed.hostname;
}  

/************************************************************************************************************
*                                   Redis Database Connection
************************************************************************************************************/
const client = redis.createClient(redisCredentials.port, redisCredentials.hostname, {no_ready_check: true});
client.auth(redisCredentials.password, (err) => {
    if (err){
        console.error(err);
        if(isLocal && runDocker){
            let command = "'$chmod 777 docker/redis_start.sh && ./docker/redis_start.sh'";
            let info = `Make sure to run ${command} in a seperate tab in a terminal to activate Redis database.`
            console.error(`\n\n****************************\n${info}\n***************************`);
            process.exit(1);     
        }
    }
});

const databaseInstantiated = new Promise((resolve, reject) =>{
    client.on('connect', function() {
        database.create(client, function(err){
            if(err){
                console.error(err.reason);
                return reject(err.reason);
            }
            console.log("Database Singleton successfully created!");
            redis_connect.onRedisConnection(client);
            return resolve(true);
        });
    });

    client.on('error', function(err){
       err && console.error(err);;
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

require('./router/main')(app, client, express); // adds the main.js file to send response to browser

// start server on the specified port and binding host
const server = app.listen(appEnv.port, () => {
    console.log(`Server starting on ${appEnv.url}`);
});

/************************************************************************************************************
*                                  Web Socket Configuration
************************************************************************************************************/
const io = socket.listen(server);
socket_connect.initiateSocket(io, client);
/************************************************************************************************************
*                                  BotKit Configuration
* SHPE-Austin Slack Integrations: https://shpeaustin.slack.com/apps/manage/custom-integrations
************************************************************************************************************/
const Botkit = require('botkit');

const controller = Botkit.slackbot({
    interactive_replies: true,
    debug: false
});

//connect the bot to a stream of messages
const bot = controller.spawn({
  token: slackCredentials.botToken,
  incoming_webhook:{
    url: slackCredentials.subscribeRequestWebHook
  }
}).startRTM();
app.set('bot', bot);             

/************************************************************************************************************
*                                  MailChimp Configuration
* Basic Subscribe Form: https://apidocs.mailchimp.com/api/how-to/basic-subscribe.php
************************************************************************************************************/
const mc = new mcapi.Mailchimp(privateCredentials.mailchimp.api_key);
app.set('mc', mc);

databaseInstantiated.then(function(){
    require('./services/slack.js')({controller, database, bot}); // Listen to different requests
}).catch(function(err){
    console.error(err);
});


