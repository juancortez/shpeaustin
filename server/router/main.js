// module.exports exposes functions that we want to use in a different file
//module.exports = function(app, con){
module.exports = function(app, express) {
    const config = require('config'),
        path = require('path'),
        database = require("../lib/database.js"),
        authorization = require('../lib/authorization.js').authorization;
    let revision = config.revision; // default if database isn't working
 
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
    // HackathonController.js
    //
    // The /hackathon endpoint is used for hackathon related material
    /*************************************************************************/
    app.use('/hackathon',  require('../controllers/HackathonController.js'));

    /*************************************************************************/
    // ShortcutsController.js
    //
    // The /shortcuts endpoint is used Apple Shortcuts
    /*************************************************************************/
    app.use('/shortcuts',  require('../controllers/ShortcutsController.js'));

    /*************************************************************************/
    // Angular2
    /*************************************************************************/
    app.use(function (req, res, next) {
        if (path.extname(req.path).length > 0) {
            // normal static file request
            next();
        }
        else {
            // redirect all html requests to `index.html`
            res.sendFile(path.resolve(__dirname + './../../dist/index.html'));
        }
    });

} // end of module exports