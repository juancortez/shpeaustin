const config = require('config');
const utils = require('./utils');
let _instance;

class FeatureSettings {
    constructor() {
        this.prelog = "<FeatureSettings>";
        this.syncIntervalMs = 30000;
        
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
        this._log("Fetching feature settings");
        this.database.get("featureSettings", (err, data) => {
            if (err) {
                this._error("Error in fetching feature settings", err);
                return;
            }
            this._log("Successfully fetched feature settings data");
            this.settings = data;
        })
    }

    _getDefaultSettings() {
        return config.defaultConfigSettings;
    }

    _log(msg) {
        console.log(`${this.prelog}: ${this._convertToString(msg)}`);
    }

    _error(msg) {
        console.error(`${this.prelog}: ${this._convertToString(msg)}`);
    }

    /* If an object, try to convert it to a string */
    _convertToString(msg) {
        if (!utils.isObject(msg)) {
            return msg;
        }

        try {
            return JSON.stringify(msg);
        } catch(e) {
            return msg;
        }
    }
}

module.exports = FeatureSettings;