const config = require('config');
const Logger = require('./logger').createLogger("<FeatureSettings>");
let _instance;

class FeatureSettings {
    constructor() {
        this.prelog = "<FeatureSettings>";
        this.syncIntervalMs = 900000;
        
        this.settings = this._getDefaultSettings();

        return _instance = this;
    }
    
    static getInstance() {
        if (_instance) {
            return _instance;
        }

        return new FeatureSettings();
    }

    getSetting(setting) {
        return this.settings[setting] || null;
    }

    setDatabase(db) {
        let self = this;
        this.database = db;

        (function sync() {
            self.getDatabaseSettings();
            setTimeout(sync, self.syncIntervalMs);
        })();
    }

    getDatabaseSettings() {
        Logger.log("Fetching feature settings");
        this.database.getData("featureSettings", (err, data) => {
            if (err) {
                Logger.error("Error in fetching feature settings", err);
                return;
            }
            Logger.log("Successfully fetched feature settings data:", data);
            this.settings = data;
        })
    }

    _getDefaultSettings() {
        return config.defaultConfigSettings;
    }
}

module.exports = FeatureSettings;