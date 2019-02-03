namespace Middleware {
    const SettingsProvider = require('./../lib/settingsProvider');
    const Logger = require('./../lib/logger').createLogger("<ShortcutsMiddleware>");
    
    module.exports = {
        shortcutsAuth: (req, res, next) => {
            const authorizationHeader = req.get('Authorization') || "";
            const password = SettingsProvider.getCredentialByPath(["blink", "password"]);
    
            if (!authorizationHeader || authorizationHeader !== password) {
                Logger.error("Unathorized request to " + req.protocol + "://" + req.get('host') + req.originalUrl);
                return res.status(403).send("Request forbidden");
            }
            
            return next();
        }
    }
}