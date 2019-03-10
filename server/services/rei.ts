import { IReiProducts, IReiProduct } from "./../models";

namespace ReiPriceBot {
    let _instance;

    const TwilioApi = require('./twilio');
    const SendGrid = require('./sendGrid');
    const PollEngine = require("./../lib/pollEngine");
    const Logger = require('./../lib/logger').createLogger("<ReiPriceBot>");
    const config = require('config');
    const request = require('request');
    const { getNestedProperty } = require('./../lib/utils');
    const reiProducts: IReiProducts = config.rei;

    export class ReiBot {
        private _numFailures: number = 0;
        private _reiEngine: any;
        private _maxAllowableFailures: number = 3;

        constructor() {
            this._reiEngine = new PollEngine({
                fn: this._checkForPricing,
                fnContext: this,
                pollMs: 60 * 60 * 1000 * 12, // Check expiry every 12 hours
                pollEngineName: "ReiPollEngine",
                startImmediate: true
            });
            _instance = this;
        }

        static getInstance() {
            if (_instance) {
              return _instance;
            }
        
            return new ReiBot();
        }

        private _checkForPricing() {
            if (!reiProducts || !reiProducts.items || !Array.isArray(reiProducts.items)) {
                Logger.error("No items found to check REI with.");
                return;
            }

            reiProducts.items.forEach((product: IReiProduct) => {
                const { productId, productName, productSellingPrice, thresholdDifference} = product;
                const lowestThresholdPricing = productSellingPrice - thresholdDifference;

                Logger.log(`Checking ${productName} (orig. ${productSellingPrice}) for prices less than ${lowestThresholdPricing}`);
                this._checkReiPricing(productName, productId, lowestThresholdPricing);

            });
        }

        private _checkReiPricing(productName, productId, lowestThresholdPricing) {
            if (this._numFailures > this._maxAllowableFailures) {
                this._reiEngine.stopPolling();
                Logger.error("Stopping poll engine, too many failures have occurred.");
                return;
            }

            // TODO: Instead of checking comparable, get XML of actual product https://www.rei.com/rest/products/106309
            const options = {
                method: 'GET',
                url: `https://www.rei.com/rest/products/associated/${productId}/COMPARABLE_PRODUCT`,
                headers: {
                    'User-Agent': 'curl/7.47.0'
                }
            };

            request(options, (error, response, body) => {
                if (error) {
                    Logger.error(`Request failure for ${productName} REI product.`);
                    this._numFailures++;
                    return;
                }
            
                let jsonResponse = null;
                try {
                    jsonResponse = JSON.parse(body);
                } catch(e) {
                    jsonResponse = null;
                    Logger.error("Invalid response....")
                }

                if (jsonResponse && Array.isArray(jsonResponse)) {
                    jsonResponse.forEach(product => {
                        const sellingPrice = getNestedProperty(["product", "sellingPrice"], product) || {};
                        const { min = Infinity } = sellingPrice;

                        if (min <= lowestThresholdPricing) {
                            this._sendNotification(productName, min);
                        } else {
                            Logger.info(`No lower price found for ${productName}.`)
                        }
                    });
                }
            });
        }

        private _sendNotification(productName, currentLowestPrice) {
            const msg = `Lower price found for ${productName} at ${currentLowestPrice}.`; 
            TwilioApi.sendMessage(msg);
            SendGrid.sendMessage(msg);
        }
    }
}

module.exports = ReiPriceBot.ReiBot;