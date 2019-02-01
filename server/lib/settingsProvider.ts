namespace Settings {
    const cfenv = require('cfenv');
    const appEnv = cfenv.getAppEnv();
    const Logger = require('./logger').createLogger("<SettingsProvider>");
    const FeatureSettings = require('./../lib/featureSettings');
    const Credentials = require('./../lib/credentialsBuilder');
    const { getNestedProperty } = require('./utils');

    export class SettingsProvider {
        private isLocal: boolean;
        private appUrl: string;
        private appPort: string;
        private featureSettings: any;
        private credentials: any;

        constructor() {
            this.isLocal = appEnv.isLocal;
            this.appUrl = appEnv.url;
            this.appPort = appEnv.port;
            this.featureSettings = FeatureSettings.getInstance();
    
            Logger.info(`Starting a ${this._isLocal() ? "local": "production"} build.`);
        }
    
        initializeCredentials() {
            this.credentials = Credentials.init();
        }
    
        /*
            Example:
            SettingsProvider.getCredentialByPath(["google_onedrive_oath", "installed", "client_secret"]);
        */
       getCredentialByPath(path) {
            return getNestedProperty(path, this.credentials);
        }
    
        getFeatureSettings() {
            return this.featureSettings;
        }
    
        isLocalDevelopment() {
            return this._isLocal();
        }
    
        getAppUrl() {
            return this.appUrl;
        }
    
        getPort() {
            return this.appPort;
        }
    
        _isLocal() {
            return this.isLocal;
        }
    }
}

module.exports = new Settings.SettingsProvider();