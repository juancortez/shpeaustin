/*
  API documentation: https://github.com/madshall/node-blink-security/blob/master/lib/blink.js
  Apple Shortcut: https://support.apple.com/guide/shortcuts/request-your-first-api-apd58d46713f/ios
*/
/// <reference path="august.ts" />
namespace ConnectedHome {
  const Blink = require('node-blink-security');
  const { to, getNestedProperty, isEmptyObject, withTimeout } = require('../lib/utils');
  const config = require('config');
  const SettingsProvider = require('../lib/settingsProvider');
  const Logger = require('./../lib/logger').createLogger("<Blink>");
  
  let _blink;
  let _instance;
  let _cache = {};
  let _blinkSyncIntervalSeconds = 60 * 1000 * 30; // default value
  
  export class BlinkApi {
    constructor() {
      const { blinkSyncIntervalSeconds } = config;
      const blinkCredentials = SettingsProvider.getCredentialByPath(["blink"]) || {};
      const { username, password } = blinkCredentials;
  
      _blink = new Blink(username, password);
      _blinkSyncIntervalSeconds = blinkSyncIntervalSeconds * 1000;
      _instance = this;
  
      return this;
    }
  
    static getInstance() {
      if (_instance) {
        return _instance;
      }
  
      return new BlinkApi();
    }
  
    async initialize() {
      const [err] = await to(withTimeout(to(_blink.setupSystem()), 5000));
      if (err) {
        return Promise.reject(err);
      } else {
        Logger.log("Successfully initialized Blink API");
        return Promise.resolve("Success!");
      }
    }
  
    isArmed() {
      return new Promise((resolve, reject) => {
        if (!_instance) {
          return reject("Not yet initialized");
        }
  
        this._getDataByPath(["network", "armed"], (err, data) => {
          if (err) {
            return reject(err);
          }
  
          return resolve(data);
        });
      });
    }
  
    async setArmed(arm = true) {
      const [err, armed] = await to(withTimeout(to(_blink.setArmed(arm)), 3000));
  
      if (err) {
        return Promise.reject(err);
      } else {
        return Promise.resolve(armed);
      }
    }
  
    synData(immediate = true) {
      setTimeout(async () => {
        const [err, data] = await to(this._getSummary());
        if (!err) {
          const date = new Date().toISOString();
          if (data && Array.isArray(data)) {
            _cache = data.filter(v => !!v).reduce((acc, current) => {
              return {
                ...acc,
                ...current
              }
            }, {});
            Logger.log(`${date}: Data updated.`);
          }
        }
        this._pollSyncData();
      }, immediate ? 0 : _blinkSyncIntervalSeconds);
    }
  
    async _getSummary() {
      const [err, summary] = await to(withTimeout(to(_blink.getSummary()), 2500));
  
      if (err) {
        return Promise.reject(err);
      } else {
        return Promise.resolve(summary);
      }
    }
  
    _getDataByPath(path, cb) {
      if (!_cache || isEmptyObject(_cache)) {
        return cb("Cache not up to date.");
      }
  
      const property = getNestedProperty(path, _cache);
      if (property === null) {
        return cb("Path does not exist");
      }
  
      return cb(null, property);
    }
    
    _pollSyncData() {
      this.synData(false);
    }
  }
}

module.exports = ConnectedHome.BlinkApi;