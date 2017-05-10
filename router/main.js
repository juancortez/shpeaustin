// module.exports exposes functions that we want to use in a different file
//module.exports = function(app, con){
module.exports = function(app, client, express) {
    const config = require('config'),
        path = require('path'),
        database = require("../lib/database.js"),
        authorization = require('../lib/authorization.js').authorization;
    let revision = config.revision; // default if database isn't working
 
    app.get('/survey', (req, res) => {
        database.getCachedData(["revisionNumber", "googleForm"], (err, data) => {
            if(!!err){
                console.error(err.reason);
            }
            const revisionNumber = data.revisionNumber.revision,
                googleLink = data.googleForm.google_form.link || "";

            revision = (!(!!err)) ? revisionNumber : revision;

            res.render('survey.html', {
                revision,
                googleLink
            });
        });
    });

    /*************************************************************************/
    // WebConferenceController.js
    //
    // The following endpoints enable WebRTC connection capabilities with appear.in
    /*************************************************************************/
    app.use('/meeting',  require('../controllers/WebConferenceController.js'));

    /*************************************************************************/
    // AuthenticationController.js
    //
    // Authenticates officers if they want to post to the page
    /*************************************************************************/
    app.use('/authentication',  require('../controllers/AuthenticationController.js'));

    /*************************************************************************/
    // DataController.js
    //
    // The following endpoints send requests to the Redis database and send data to the frontend
    /*************************************************************************/
    app.use('/data',  require('../controllers/DataController.js'));

    /*************************************************************************/
    // UpdateController.js
    // 
    // The following endpoints POST data to the Redis database
    /*************************************************************************/
    app.use('/update',  require('../controllers/UpdateController.js'));

    /*************************************************************************/
    // CommunicationController.js
    //
    // The /contact endpoint sends e-mails from the form in the Contact Us page
    /*************************************************************************/
    app.use('/communication',  require('../controllers/CommunicationController.js'));

    /*************************************************************************/
    // Catch all other routes and return them to the index file for Angular2 to
    // handle them
    /*************************************************************************/
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../src', 'index.html'));
    });

} // end of module exports