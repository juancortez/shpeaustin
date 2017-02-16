`
    Author: Juan Cortez

    This node.js application serves both the client and server side of the SHPE Austin Website (austinshpe.org).

    When running locally:
        $npm start
    Deploying application to Bluemix:
        $cf push

`

const express = require('express'),
    app = express(),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
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
    database = require("./lib/database.js"),
    cloudant = require("./lib/cloudant.js"),
    mcapi = require('mailchimp-api');
// only load up console if developing locally
if(appEnv.isLocal){
    const _console = require("./lib/console.js");
}   
/************************************************************************************************************
*                                   Redis Database Connection
************************************************************************************************************/
const client = redis.createClient(redisCredentials.port, redisCredentials.hostname, {no_ready_check: true});
client.auth(redisCredentials.password, (err) => {
    if (err){
        console.error(err);
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
});
/************************************************************************************************************
*                                   Cloudant Database Creation
************************************************************************************************************/
// cloudant.init(privateCredentials.cloudant, (err) =>{
//     if(err) return console.error(err);
//     // race condition bug fix
//     setTimeout(() => { console.log("Cloudant successfully initialized!"); testCloudant(); }, 2000);
// });

// function testCloudant(){
//     cloudant.execute({
//         "method" : "GET",
//         "document" : "businesscard",
//         "data" : null,
//         "callback" : function(err, data){
//             if(err) return console.error(err.reason);
//             data && console.log(data);
//         }
//     });
// }

/************************************************************************************************************
*                                  Express App Configuration
************************************************************************************************************/
app.use(compression()); //use compression 
app.use(express.static(__dirname + '/public', { maxAge: 604800000 /* 7d */ })); // 1d = 86400000
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(favicon(__dirname + '/public/assets/shpe_austin_icon.png'));
require('./router/main')(app, client); // adds the main.js file to send response to browser
app.set('views', __dirname + '/views'); // defines where our HTML files are placed
app.set('view engine', 'ejs'); // used for HTML rendering
app.engine('html', require('ejs').__express); // rendering HTML files through EJS

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
    require('./services/slack.js')(controller, client, database, privateCredentials, bot); // Listen to different requests
}).catch(function(err){
    console.error(err);
});