// module.exports exposes functions that we want to use in a different file
//module.exports = function(app, con){
namespace Routes {
    module.exports = function(app) {
        const path = require('path');
     
        /*************************************************************************/
        // AuthenticationController.ts
        //
        // Authenticates officers if they want to post to the page
        /*************************************************************************/
        app.use('/authentication',  require('../controllers/AuthenticationController'));
    
        /*************************************************************************/
        // DataController.ts
        //
        // The following endpoints send requests to the Redis database and send data to the frontend
        /*************************************************************************/
        app.use('/data',  require('../controllers/DataController'));
    
        /*************************************************************************/
        // UpdateController.ts
        // 
        // The following endpoints POST data to the Redis database
        /*************************************************************************/
        app.use('/update',  require('../controllers/UpdateController'));
    
        /*************************************************************************/
        // CommunicationController.ts
        //
        // The /contact endpoint sends e-mails from the form in the Contact Us page
        /*************************************************************************/
        app.use('/communication',  require('../controllers/CommunicationController'));
    
        // /*************************************************************************/
        // // HackathonController.ts
        // //
        // // The /hackathon endpoint is used for hackathon related material
        // /*************************************************************************/
        // app.use('/hackathon',  require('../controllers/HackathonController'));
    
        /*************************************************************************/
        // ShortcutsController.ts
        //
        // The /shortcuts endpoint is used Apple Shortcuts
        /*************************************************************************/
        app.use('/shortcuts',  require('../controllers/ShortcutsController'));
    
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
    
    }
}