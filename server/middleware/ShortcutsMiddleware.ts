namespace Middleware {
    const SettingsProvider = require('./../lib/settingsProvider');
    
    module.exports = {
        shortcutsAuth: (req, res, next) => {
            const authorizationHeader = req.get('Authorization') || "";
            const password = SettingsProvider.getCredentialByPath(["blink", "password"]);
    
            if (!authorizationHeader || authorizationHeader !== password) {
                return res.status(403).send("Request forbidden");
            }
            
            return next();
        }
    }
}