`
 credentialsBuilder.js

 Created by: Juan Cortez
 Date Created: September 5, 2016

 Created this file to enable "travis automatic build and deploy" to work when pushing code to GitHub. It only gets instantiated
 once, since it is a Singleton.

 The only way the Travis build will work is if the private credentials are stored on GitHub, but I do not want to expose 
 API keys or passwords. The way I solved this was by storing all of the important keys on BlueMix User-Defined Environment Variables. 
 They can be accessed by looking into the process.env.NAME property.
 
 If running locally, just read from the private_credentials/credentials.json file.
`
namespace PrivateCredentials {
	const Logger = require('./logger').createLogger("<CredentialsBuilder>");

	const Credentials = (() => {
		let instance; // Instance stores a reference to the Singleton
	
		// Singleton
		function init() {
			const SettingsProvider = require('./settingsProvider');
			const isLocal = SettingsProvider.isLocalDevelopment();
			const privateCredentials = _constructPrivateCredentials(isLocal);
	
			function retrieveCredentials(){
				return privateCredentials;
			}
	
	
			function _constructPrivateCredentials(isLocal) {
				if(!!isLocal){
					Logger.log("Retrieving local credentials...");
					return require('./../../private_credentials/credentials.json');
				} else{
					Logger.log("Retrieving credentials from user-defined Bluemix variables");
					let privateCredentialsBuilder: any = {};
					privateCredentialsBuilder.redis = {};
					privateCredentialsBuilder.redis.credentials = {};
					privateCredentialsBuilder.redis.credentials.port = process.env.redisPort;
					privateCredentialsBuilder.redis.credentials.hostname = process.env.redisHostname;
					privateCredentialsBuilder.redis.credentials.password = process.env.redisPassword;
					privateCredentialsBuilder.slack = {};
					privateCredentialsBuilder.slack.botToken = process.env.botToken;
					privateCredentialsBuilder.slack.subscribeRequestWebHook = process.env.subscribeRequestWebHook;
					privateCredentialsBuilder.slack.outgoingToken = process.env.outgoingToken;
					privateCredentialsBuilder.websiteLogin = {};
					privateCredentialsBuilder.websiteLogin.username = process.env.webUser;
					privateCredentialsBuilder.websiteLogin.password = process.env.webPass;
					privateCredentialsBuilder.google_onedrive_oath = {};
					privateCredentialsBuilder.google_onedrive_oath.installed = {};
					privateCredentialsBuilder.google_onedrive_oath.installed.client_secret = process.env.googleDriveClientSecret;
					privateCredentialsBuilder.google_onedrive_oath.installed.client_id = process.env.googleDriveClientId;
					privateCredentialsBuilder.google_onedrive_oath.installed.redirect_uris = [];
					privateCredentialsBuilder.google_onedrive_oath.installed.redirect_uris.push(process.env.googleDriveRedirectUri);
					privateCredentialsBuilder.google_oauth = {};
					privateCredentialsBuilder.google_oauth.installed = {};
					privateCredentialsBuilder.google_oauth.installed.client_secret = process.env.googleClientSecret;
					privateCredentialsBuilder.google_oauth.installed.client_id = process.env.googleClientId;
					privateCredentialsBuilder.google_oauth.installed.redirect_uris = [];
					privateCredentialsBuilder.google_oauth.installed.redirect_uris.push(process.env.googleRedirectUris);
					privateCredentialsBuilder.googleDriveCredentials = {};
					privateCredentialsBuilder.googleDriveCredentials.access_token = process.env.googleDriveAccessToken;
					privateCredentialsBuilder.googleDriveCredentials.token_type = process.env.googleDriveTokenType;
					privateCredentialsBuilder.googleDriveCredentials.refresh_token = process.env.googleDriveRefreshToken;
					privateCredentialsBuilder.googleDriveCredentials.scope = process.env.googleDriveScopes;
					privateCredentialsBuilder.googleDriveCredentials.expiry_date = process.env.googleDriveExpiryDate;
					privateCredentialsBuilder.sendGrid = {};
					privateCredentialsBuilder.sendGrid.apiKey = process.env.sendGridPass;
					privateCredentialsBuilder.mailchimp = {};
					privateCredentialsBuilder.mailchimp.api_key = process.env.mailchimp;
					privateCredentialsBuilder.googleDriveAuth = {};
					privateCredentialsBuilder.googleAuth = {};
					privateCredentialsBuilder.googleAuth.access_token = process.env.googleAccessToken;
					privateCredentialsBuilder.googleAuth.token_type = process.env.googleTokenType;
					privateCredentialsBuilder.googleAuth.refresh_token = process.env.googleRefreshToken;
					privateCredentialsBuilder.googleAuth.expiry_date = process.env.googleExpiryDate;
					privateCredentialsBuilder.shpeaustincloudant = {};
					privateCredentialsBuilder.shpeaustincloudant.username = process.env.cloudantKey;
					privateCredentialsBuilder.shpeaustincloudant.password = process.env.cloudantPassword;
					privateCredentialsBuilder.blink = {};
					privateCredentialsBuilder.blink.username = process.env.blinkUserName;
					privateCredentialsBuilder.blink.password = process.env.blinkPassword;
					privateCredentialsBuilder.august = {};
					privateCredentialsBuilder.august.token = process.env.augustToken;
					privateCredentialsBuilder.twilio = {};
					privateCredentialsBuilder.twilio.account = process.env.twilioAccount;
					privateCredentialsBuilder.twilio.authToken = process.env.twilioToken;
					privateCredentialsBuilder.twilio.twilioNumber = process.env.twilioNumber;
					privateCredentialsBuilder.twilio.personalNumber = process.env.twilioPersonalNumber;
	
					return privateCredentialsBuilder;
				}
			}
	
			return{
				retrieveCredentials
			};
		};
	  
		return {
			// Get the Singleton instance if one exists
			// or create one if it doesn't
			getInstance: () => {
				if (!instance) {
					instance = init();
				}
				return instance;
			}
		};
	})();
	
	
	export function init() {
		var credentials = Credentials.getInstance();
		return credentials.retrieveCredentials();
	}
}


module.exports = {
	init: PrivateCredentials.init
}