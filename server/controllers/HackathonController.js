`
    CommunicationController.js 
    Endpoint: /hackathon

    Hackathon related server code
`

const express = require('express'),
    app = express();

/*
 * Return the SHPE Austin List
 */
app.get('/office/online', (req, res) => {
    return res.status(200).send("All is okay");
});


module.exports = app;