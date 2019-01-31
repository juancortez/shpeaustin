namespace FeatureSettings {
    const config = require('config');
    const Logger = require('./logger').createLogger("<FeatureSettings>");
    const PollEngine = require('./pollEngine');
    let _instance;
    
    export class Settings {
        private syncIntervalMs: number;
        private settings: any;
        private database: any;

        constructor() {
            this.syncIntervalMs = 900000;
            
            this.settings = this._getDefaultSettings();
    
            return _instance = this;
        }
        
        static getInstance() {
            if (_instance) {
                return _instance;
            }
    
            return new Settings();
        }
    
        getSetting(setting) {
            return this.settings[setting] || null;
        }
    
        setDatabase(db) {
            this.database = db;
    
            new PollEngine({
                fn: this.getDatabaseSettings,
                fnContext: this,
                pollMs: this.syncIntervalMs,
                pollEngineName: "Feature Settings",
                startImmediate: true
            });
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
}

module.exports = FeatureSettings.Settings;