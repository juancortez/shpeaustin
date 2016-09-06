module.exports = (controller, client) => {
    // give the bot something to listen for.
    controller.hears('hello', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
        bot.reply(message, 'Hello!');
    });


    var pizzaUsers = {}; // TODO, move this over to database

    controller.hears(['pizzatime', 'pizza', 'order pizza'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
        askName = (response, convo) => {
            convo.ask(_buildPizzaMessage("Hi! Who will be placing the order today?"), (response, convo) => {
                const userName = _capitalizeFirstLetter(_returnResponse(response, 'text')),
                    userid = _returnResponse(response, 'user');
                if (pizzaUsers[userid]) {
                    convo.say(_buildPizzaMessage(`Hi, ${userName}! We noticed you have ordered from us before!`));
                    const currentUser = pizzaUsers[userid],
                        speech = `Last time, you ordered a ${currentUser.size} ${currentUser.flavor} pizza, delivered to ${currentUser.delivery}. Would you like to place the same order?`;
                     _verifyResponse(userid, convo, {
                        speech: speech,
                        yes: _deliverPizza,
                        no: askFlavor
                     });
                } else {
                    pizzaUsers[userid] = {};
                    _updatePizzaData(userid, "name", userName);
                    convo.say(_buildPizzaMessage(`Hi, ${userName}, we noticed that this is your first time here. Welcome!`));
                    askFlavor(userid, convo);
                }
                convo.next();
            });
        };

        askFlavor = (userid, convo) => {
            convo.ask(_buildPizzaMessage('What flavor of pizza do you want?'), (response, convo) => {
                const flavor = _returnResponse(response, 'text');
                _updatePizzaData(userid, "flavor", flavor);
                askSize(userid, convo);
                convo.next();
            });
        }

        askSize = (userid, convo) => {
            convo.ask(_buildPizzaMessage('What size do you want?'), (response, convo) => {
                const size = _returnResponse(response, 'text');
                _updatePizzaData(userid, "size", size);
                askWhereDeliver(userid, convo);
                convo.next();
            });
        }
        askWhereDeliver = (userid, convo) => {
            convo.ask(_buildPizzaMessage('So where do you want it delivered?'), (response, convo) => {
                const delivery = _returnResponse(response, 'text');
                _updatePizzaData(userid, "delivery", delivery);
                _verifyPizzaOrder(userid, convo);
                convo.next();
            });
        }

        _verifyPizzaOrder = (userid, convo) => {
            const currentUser = pizzaUsers[userid],
                order = `${currentUser.name}, I have a ${currentUser.size} ${currentUser.flavor} pizza being delivered to ${currentUser.delivery}, is this correct?`;

            convo.ask(_buildPizzaMessage(order), (response, convo) => {
                const yesNo = _returnResponse(response, 'text').toLowerCase();
                if (yesNo === "yes") {
                    _deliverPizza(userid, convo);
                } else {
                    _changeOrder(userid, convo);
                }
                convo.next();
            });
        };

        _changeOrder = (userid, convo) => {
            convo.ask(_buildPizzaMessage('Would you like to change the flavor, size, or delivery?'), (response, convo) => {
                const changeOrder = _returnResponse(response, 'text').toLowerCase(),
                    validChanges = ['flavor', 'size', 'delivery'];
                if(!validChanges.includes(changeOrder)){
                    convo.say(_buildPizzaMessage(`Sorry, ${changeOrder} is not a valid.`));
                    _changeOrder(userid, convo);
                } else{
                    _changeToOrder(changeOrder, userid, convo);
                }
                convo.next();
            });
        };

        _changeToOrder = (changeOrder, userid, convo) => {
            convo.ask(_buildPizzaMessage(`What would you like to change ${changeOrder} to?`), (response, convo) => {
                const newRequest = _returnResponse(response, 'text');
                _updatePizzaData(userid, changeOrder, newRequest);
                _verifyPizzaOrder(userid, convo);
                convo.next();
            });
        };

        _verifyResponse = (userid, convo, next) => {
            let speech = next.speech;
            convo.ask(_buildPizzaMessage(speech), (response, convo) => {
                let yesNo = _returnResponse(response, 'text').toLowerCase();
                if (yesNo === "yes") {
                    next.yes(userid, convo);
                } else {
                    next.no(userid, convo);
                }
                convo.next();
            });
        };

        _deliverPizza = (userid, convo) => {
            convo.say(_buildPizzaMessage(`Great, ${pizzaUsers[userid].name}! Your order will be delivered in 10 minutes!`));
        };

        _updatePizzaData = (userid, key, data) => {
            pizzaUsers[userid][key] = data;
        }

        _buildPizzaMessage = (text) => {
            return {
              text,
              username: "PizzaBot",
              icon_emoji: ":pizza:",
            }
        }


        bot.startConversation(message, askName);
    });


    _buildOptionMessage = (options) => {
        if(options.constructor !== Array && options.length > 5){
            console.error(`Must provide an array of options greater than 0 and less than 5.`);
            return text;
        }
        const numberOptions = [":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:"];

        let text = `Here are your options: \n`;

        options.forEach(function(option, index){
            text += `${numberOptions[index]}: ${options[index]}\n`;
        });

        return {
          text,
          username: "PizzaBot",
          icon_emoji: ":pizza:",
        }
    }


    `
        Can return any of the following properties of response:
            [type, channel, user, text, ts, team, question]
        `

    function _returnResponse(response, type) {
        if (!(!!response[type])) {
            console.error(`${type} does not exist!`);
            return null;
        }
        return response[type];
    }

    function _capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};