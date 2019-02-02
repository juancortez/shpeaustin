`
    Author: Juan Cortez

    This node.js application serves both the client and server side of the SHPE Austin Website (austinshpe.org).
`
namespace Application {
    const express = require('express'),
        SettingsProvider = require('./lib/settingsProvider'),
        app = express(),
        bodyParser = require('body-parser'),
        favicon = require('serve-favicon'),
        compression = require('compression'),
        path = require('path'),
        Logger = require('./lib/logger').createLogger("<App>");

    
    export function start() {
        SettingsProvider.initializeCredentials();

        if (SettingsProvider.isLocalDevelopment()) {
            const Console = require('./lib/console');
            Console.init();
        }

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

        if (SettingsProvider.isLocalDevelopment()) {
            app.get('/playground/react', function(req, res) {
                return res.sendFile(path.join(staticRoot + '/views/react.html'), {
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
            });
        }

        const Services = require('./services/index');
        const ExpressControllers = require('./router/main');

        // Add all other routes to express application
        ExpressControllers(app, express);

        // start server on the specified port and binding host
        const server = app.listen(SettingsProvider.getPort(), () => {
            Logger.info(`Server starting on ${SettingsProvider.getAppUrl()}`);
        });

        // initialize all services
        Services(server, app);
    }
}

Application.start();