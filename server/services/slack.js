const request = require("request"),
    config = require('config')
    privateCredentials = require('../lib/credentialsBuilder.js').init(),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    port = appEnv.port,
    baseUrl = appEnv.isLocal ? config.get('app.local') + port : config.get('app.deployed');

module.exports = ({controller, database, bot}) => {

    controller.hears('hello', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
        bot.reply(message, 'Hello, how are you?');
    });

    controller.hears('update calendar', ['direct_message'], (bot, message) => {
        _invokeCalendarUpdate((err) => {
            if(err){
                console.error(err);
                bot.reply(message, _buildShpeMessage({
                    text: 'Sorry, Google calendar did not update.'
                }));
            } else{
                bot.reply(message, _buildShpeMessage({
                    text: 'Google calendar successfully updated!'
                }));
            }
        });
    });

    controller.hears('new announcement', ['direct_message'], (bot, message) => {

       constructAnnouncement = (response, convo) => {
            database.getCachedData('officerList', (err, officerData) => {
                let officers = officerData.map(officer => officer.name);
                convo.ask(_buildShpeMessage({
                    text: "Who is posting the announcement?",
                    attachmentsArray: officers
                }), (response, convo) => {
                    let officerName = response['text'];
                    let regExp = new RegExp(officerName, 'i');
                    let officer = [];
                    officer = officers.filter((officer) => {
                        if(regExp.test(officer)) return true;
                    });

                    if(officer.length === 0) return convo.repeat();
                    else officer = officer[0];
                    convo.ask(_buildShpeMessage({
                        text: `Thanks, ${officer}. What would you like to post?`
                    }), (response, convo) => {
                        let announcement = response['text'];
                        convo.ask(_buildShpeMessage({
                            text: `I got: "${announcement}". Are you sure you want to post this? Respond with yes or no.`
                        }), (response, convo) => {
                            let answer = response['text'];
                            answer = answer.toLocaleLowerCase();
                            if(answer === "yes"){
                                const authorization = _createAuthorization();
                                const options = { 
                                    'method': 'POST',
                                    'url': `${baseUrl}/update/announcements`,
                                    'headers': {
                                        authorization,
                                        'cache-control': 'no-cache',
                                        'content-type': 'application/json' 
                                    },
                                    'body': { 
                                        officer,
                                        announcement,
                                        timestamp: new Date().getTime() 
                                },
                                    json: true 
                                };

                                request(options, function (error, response, body) {
                                    if (error){
                                        bot.reply(message, _buildShpeMessage({
                                            text: `Sorry, there was an error in making the announcement`
                                        }));
                                        console.error(error);
                                        return convo.stop();
                                    }
                                    bot.reply(message, _buildShpeMessage({
                                        text: `Great, ${officer}, creating an announcement now.`
                                    }));
                                    return convo.stop();
                                });
                            } else{
                                bot.reply(message, _buildShpeMessage({
                                    text: "Got it, won't create a new announcement."
                                }));
                                return convo.stop();
                            }
                        });
                        convo.next();
                    });
                    convo.next();
                });
            });
        };
        bot.startConversation(message, constructAnnouncement);
    });

    controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {
        bot.startConversation(message, function(err, convo) {
            convo.ask(_buildShpeMessage({
                text: 'Are you sure you want me to shutdown?'
            }),[
                {
                    pattern: bot.utterances.yes,
                    callback: function(response, convo) {
                        convo.ask(_buildShpeMessage({
                            text: "What is the password?"
                        }), (response, convo) => {
                            let answer = response['text'];
                            const creds = privateCredentials.websiteLogin;
                            if(answer === creds.password){
                                bot.reply(message, _buildShpeMessage({
                                    text: `Shutting down server.`
                                }));
                                setTimeout(function() {
                                    process.exit();
                                }, 3000);
                            } else{
                                bot.reply(message, _buildShpeMessage({
                                    text: `Invalid password, not shutting down.`
                                }));
                            }
                            return convo.stop();
                        });
                        convo.next();
                    }
                },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function(response, convo) {
                    convo.say('*Phew!*');
                    convo.next();
                }
            }
            ]);
        });
    });

    _createAuthorization = () => {
        this.authorization = this.authorization || null;
        if(this.authorization) return this.authorization;

        const credentials = privateCredentials.websiteLogin,
            authorizationToken = credentials.username + ":" + credentials.password;
        const authorization = "Basic " + new Buffer(authorizationToken).toString('base64');
        return this.authorization = authorization;
    }

    _invokeCalendarUpdate = (cb) => {
        const authorization = _createAuthorization();
        const options = { 
            method: 'POST',
            url: `${baseUrl}/update/calendar`,
            headers: { 
                authorization: authorization
            }
        };

        request(options, (error, response, body) => {
            console.log(body);
            if (error){
                return cb(error);
            } 
            return cb();
        });
    }

    _buildShpeMessage = (args) => {
        let{
            text,
            attachmentsArray
        } = args;

        let attachmentStructure = {
            "fallback": "Required plain-text summary of the attachment.",
            "color": "#36a64f",
            "fields": [
                {
                    "value": "High",
                    "short": false
                }
            ]
        };

        let buildAttachment = attachmentStructure;
        let fields = [];

        if(attachmentsArray !== undefined){
            for(let i = 0; i < attachmentsArray.length; i++){
                (function(element){
                    let messageAttachment = {
                        "value": "",
                        "short": false
                    };
                    messageAttachment.value = attachmentsArray[element];
                    fields.push(messageAttachment);
                })(i);
            }   
            buildAttachment.fields = fields;
        }

        if(attachmentsArray !== undefined){
            let finalAttachment = [];
            finalAttachment.push(buildAttachment);
            let result = {
              text: text,
              attachments: finalAttachment,
              username: "SHPE-Update-Bot",
              icon_emoji: ":computer:"
            }
            return result;
        } else{
            return {
              text,
              username: "SHPE-Update-Bot",
              icon_emoji: ":computer:"
            }
        }
    }
};