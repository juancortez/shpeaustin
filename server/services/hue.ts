import { IHueLights, HueLight } from "./../models";

/// <reference path="august.ts" />
namespace ConnectedHome {
    const PhilipsHue = require('philips-hue');
    const Logger = require('./../lib/logger').createLogger("<Hue>");
    const SettingsProvider = require('../lib/settingsProvider');

    class Hue {
        private static _hueInstance;
        private _hueApi;
        private _hueApiConfig;
        private _hueLightConfig: IHueLights;
        private _prefetchHuePromise: Promise<any>;

        constructor() {
            const hueBridgeIp = SettingsProvider.getCredentialByPath(["hue", "bridge"]);
            const hueBridgeUsername = SettingsProvider.getCredentialByPath(["hue", "username"]);
            this._hueApi = new PhilipsHue();

            this._hueApi.bridge = hueBridgeIp;
            this._hueApi.username = hueBridgeUsername;
            this._prefetchHueConfig();

            Logger.log("Successfully initialized Hue API");
        }

        static getInstance() {
            if (Hue._hueInstance) {
                return Hue._hueInstance;
            }
        
            return Hue._hueInstance = new Hue();
        }

        public turnOn(light: HueLight) {
            this._prefetchHuePromise
                .then(_ => {
                    const lightFromConfig: number = this._hueLightConfig[light];
                    this._hueApi.light(lightFromConfig).on();
                    Logger.log("Successfully turned on Phillips Hue light.");
                })
                .catch(_ => {
                    this._logNotEnabledError();
                });
        }

        public turnOff(light: HueLight) {
            this._prefetchHuePromise
                .then(_ => {
                    const lightFromConfig: number = this._hueLightConfig[light];
                    this._hueApi.light(lightFromConfig).off();
                    Logger.log("Successfully turned off Phillips Hue light.");
                })
                .catch(_ => {
                    this._logNotEnabledError();
                });
        }

        private _logNotEnabledError() {
            Logger.error("Unable to perform operation, Phillips Hue not current enabled.");
            return;
        }

        private async _prefetchHueConfig() {
            this._prefetchHuePromise = new Promise((resolve, reject) => {
                this._getLights()
                    .then(config => {
                        Logger.log("Successfully pre-fetched Phillips Hue API data.");
    
                        this._hueApiConfig = config;
            
                        this._hueLightConfig = {
                            [HueLight.Bed]: this._findLightIndex("Bed"),
                            [HueLight.Bedside]: this._findLightIndex("Bedside"),
                            [HueLight.BottomDining]: this._findLightIndex("Bottom Dining"),
                            [HueLight.Closet]: this._findLightIndex("Closet"),
                            [HueLight.TopDining]: this._findLightIndex("Top Dining")
                        };

                        return resolve();
                    }).catch(err => {
                        Logger.error("Unable to prefetch data, unable to use Phillips Hue API.", err);
                        return reject();
                    });
            });
        }

        private _findLightIndex(light: string): number {
            const matchingLight: string[] = Object.keys(this._hueApiConfig).filter((key) => {
                const currentLight = this._hueApiConfig[key];
                const lightName = currentLight && currentLight.name;
                return lightName === light;
            });

            if (matchingLight.length < 0) {
                Logger.error(`Was not able to find ${light} light in config.`);
                return -1;
            }

            return +matchingLight[0];
        }

        private _getLights() {
            return this._hueApi.getLights()
                .then(function(lights){
                    return lights;
                });
        }
    }

    module.exports = Hue;
}