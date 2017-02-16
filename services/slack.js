module.exports = (controller, client, database, privateCredentials, bot) => {

    controller.hears('hello', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
        bot.reply(message, 'Hello!');
    });

    controller.hears('update', ['direct_message'], (bot, message) => {
        updateWhat = (response, convo) => {
            database.getKeys((err, keys) => {
                convo.ask(_buildShpeMessage({
                    text: "What would you like for me to update?",
                    attachmentsArray: keys
                }), (response, convo) => {
                    let keyUpdate = response['text'];
                    if(keys.includes(keyUpdate)){
                        database.getCachedData(keyUpdate, (err, data) => {
                            if(err){
                                console.error(err.reason);
                                return convo.stop();
                            }
                            if(keyUpdate === "calendar"){
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
                                    return convo.stop();
                                });
                            } else{
                                convo.ask(_buildShpeMessage({
                                    text: `What would you like to update this data to? ${JSON.stringify(data)}`
                                }), (response, convo) =>{
                                    let updatedData = response['text'];
                                    database.setData(keyUpdate, updatedData, (err, data) => {
                                        if(err){
                                            bot.reply(message, _buildShpeMessage({
                                                text: `Sorry, your data couldn't be updated :/`
                                            }));
                                            console.error(err.reason);
                                            return convo.stop();
                                        } else{
                                            bot.reply(message, _buildShpeMessage({
                                                text: `Thank you, your data has been updated to ${updatedData}`
                                            }));
                                        }
                                        return convo.stop();
                                    });
                                    convo.next();   
                                });
                                convo.next();      
                            }
                        });
                    } else{
                        convo.repeat();
                    }
                    convo.next();
                });
            });
        };

        _invokeCalendarUpdate = (cb) => {
            const credentials = privateCredentials.websiteLogin,
                authorizationToken = credentials.username + ":" + credentials.password;

            const request = require('request');
            const authorization = "Basic " + new Buffer(authorizationToken).toString('base64');

            const options = { 
                method: 'POST',
                url: 'http://us.austinshpe.org/update/calendar',
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

        bot.startConversation(message, updateWhat);
    });
};