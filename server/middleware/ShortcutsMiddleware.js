const privateCredentials = require('./../lib/credentialsBuilder.js').init();

module.exports = {
    shortcutsAuth: (req, res, next) => {
        const authorizationHeader = req.get('Authorization') || "";

        if (!authorizationHeader || authorizationHeader !== privateCredentials.blink.password) {
            return res.status(403).send("Request forbidden");
        }
        
        return next();
    }
}