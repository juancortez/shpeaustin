`
    Author: Juan Cortez

    This node.js application serves both the client and server side of the SHPE Austin Website (austinshpe.org).
`

const express = require('express'),
    app = express(),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    isLocal = appEnv.isLocal,
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon'),
    compression = require('compression'),
    privateCredentials = require('./lib/credentialsBuilder.js').init(),
    path = require('path'),
    Services = require('./services/index'),
    ExpressControllers = require('./router/main'),
    Logger = require('./lib/logger').createLogger("<App>"),
    Console = require('./lib/console').init();

const root = path.join(__dirname + '/../'),
    staticRoot = path.join(__dirname + '/../public/');

/***********************************************************************************************************
*                                  Express App Configuration
***********************************************************************************************************/
app.use(compression()); //use compression 
app.use(express.static(staticRoot, { maxAge: 604800000 /* 7d */ })); // 1d = 86400000
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(favicon(staticRoot + '/assets/shpe_austin_icon.png'));

app.use('/', express.static(root + '/dist'));
app.use('/scripts', express.static(root + '/node_modules'));

if (isLocal) {
    app.get('/playground/react', function(req, res) {
        return res.sendFile(path.join(staticRoot + '/views/react.html'), {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
    });
}

// Add all other routes to express application
ExpressControllers(app, express);

// start server on the specified port and binding host
const server = app.listen(appEnv.port, () => {
    Logger.log(`Server starting on ${appEnv.url}`);
});

// initialize all services
Services(server, app);