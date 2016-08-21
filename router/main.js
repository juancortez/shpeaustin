// module.exports exposes functions that we want to use in a different file
//module.exports = function(app, con){
module.exports = function(app, client) {
    var config = require('config'),
        revision = config.revision; // global variable for revision number
    
    /*************************************************************************/
    // The following endpoints serve HTML pages
    /*************************************************************************/
    app.get('/', function(req, res) {
        res.render('index.html', {
            revision: revision
        });
    });

    app.get('/about', function(req, res) {
        res.render('about.html', {
            revision: revision
        });
    });

    app.get('/officers', function(req, res) {
        client.get('officerList', function (err, officerList) {
            if(officerList){
                res.render('officers.ejs', {
                    officerList: JSON.parse(officerList),
                    revision: revision
                });
            } else{
                console.error(err);
                res.sendStatus(404);
            }
        });
    });

    app.get('/membership', function(req, res) {
        res.render('membership.html', {
            revision: revision
        });
    });

    app.get('/contact', function(req, res) {
        res.render('contact.html', {
            revision: revision
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
    // If endpoint does not exist, render an error
    /*************************************************************************/

    app.get('*', function(req, res) {
        res.render('404.html', {
            revision: revision 
        });
        //res.status(400).send({ error: 'HTML Error 404: Not Found!' });
    });

} // end of module exports