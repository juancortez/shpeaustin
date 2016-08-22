/*************************************************************************/
// CommunicationController.js 
// Endpoint: /communication
// 
// The following endpoints authenticate users
/*************************************************************************/
var express = require('express'),
    app = express(),
    config = require('config'),
    privateCredentials = require('../private_credentials/credentials.json');

app.post('/contact', function(req, res) {
    var bot = req.app.get('bot');  

    if (process.env.VCAP_SERVICES) {
        var env = JSON.parse(process.env.VCAP_SERVICES);
        var credentials = env['sendgrid'][0].credentials;
    } else {
        var credentials = privateCredentials.sendgrid.credentials;
    }

    //sendgrid documentation and attaching to bluemix: https://github.com/sendgrid/reseller-docs/tree/master/IBM
    var sendgrid  = require('sendgrid')(credentials.username, credentials.password),
        sendGridEmail = config.sendGrid.sendGridEmail;

    var name = req.body.name || "",
        phone = req.body.phone || null,
        email = req.body.email || "",
        category = req.body.category || "",
        message = req.body.message || "",
        subscribe = req.body.subscribe || false;

    var messageSent = "Name: " + name + " Phone Number: " + phone + " E-mail Address: " + email +
        " Subject: " + category + " Message: " + message;

    console.log("Sending the following message to : " + sendGridEmail);
    console.log(messageSent);

    if(subscribe){
      /* Incoming WebHook using botland*/
      // https://api.slack.com/incoming-webhooks
      bot.sendWebhook({
        text: "Please add the following email address " + email + " to the newsletter."
      },function(err,res) {
        if (err) {
          console.error("Webhook error: " + err);
        }
        console.log("Incoming webhook result: " + res);
      });  
    }

    sendgrid.send({
      to:       sendGridEmail,
      from:     email,
      subject:  'SHPE Austin Website Message',
      text: messageSent,
      html: " <b>Name:</b> " + name + "<br> <b>Phone number:</b> " + phone + "<br><b>E-mail address:</b> " + email +
         "<br><b> Category:</b> " + category + "<br><b>Message:</b> " + message
    }, function(err, json) {
        if (err) { 
            console.error(err); 
            res.sendStatus(400);
        }
      res.sendStatus(200);
      console.log("E-mail sent successfully. " + JSON.stringify(json) + " \nSent to: " + sendGridEmail);
    });
});

// Outgoing Webhook provided by the SHPE Austin Bot
app.post('/bot/officers', function(req, res){
  var botToken = privateCredentials.slack.outgoingToken,
      outgoingHook = req.body,
      triggerWord = outgoingHook && outgoingHook.trigger_word && outgoingHook.trigger_word.toLocaleLowerCase() || "",
      client = req.app.get('redis'); 

  if(botToken != outgoingHook.token){
    res.sendStatus(401);
    return;
  }

  var unsupportedCommand = "Sorry, outgoing webhook not yet supported. Please contact your webmaster.";
  if(triggerWord === "who is"){
    var officerSearch = outgoingHook.text.toLocaleLowerCase();
        officerSearch = officerSearch.replace("who is ", "");

    client.get('officerList', function (err, officerList) {
      if(officerList){
        officerList = JSON.parse(officerList);

        // filter all officers and find the officer that they are looking for
        var officerFound = officerList.filter(function(officer){
          var currentOfficer = officer.name.toLocaleLowerCase();
          if(currentOfficer.indexOf(officerSearch) != -1){
            return true;
          }
        });
        try{
          if(officerFound.length > 1){
            similarNames = true;
            throw "error";
          } else if(officerFound.length == 0){
            similarNames = false;
            throw "error";
          }
          officerFound = officerFound[0];  
        } catch(e){
          res.send({
            "text": "Sorry, I was not able to find " + officerSearch + (similarNames ? ". There were multiple matches, please be more specific." : ".")
           });
          return;
        }
        
        var name = officerFound.name,
            position = officerFound.position,
            email = officerFound.email,
            phone = officerFound.phone;

        var result = "I found " + name + "!\n Their position in SHPE Austin is " + position + ".\n If you would like to contact this individual," + 
                     " you can either contact them via e-mail at " + email + " or via phone at " + phone + "."

        res.send({
          'text': result
        });
      } else{
         res.send({
          "text": "Sorry, I was not able to find any officer data. Please contact your webmaster."
         });
      }
    });
  } else{
    res.send({
      "text": unsupportedCommand
    });
    return;
  }
});

module.exports = app;
