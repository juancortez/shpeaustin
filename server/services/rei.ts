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
    const convert = require('xml-js');

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

            const options = {
                method: 'GET',
                url: `https://www.rei.com/rest/products/${productId}`,
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
                
                try {
                    // REI API is not consistent, check if xml or stringified JSON
                    const bodyIsXml = typeof body === "string" && /\?xml/.test(body);
                    let resultJson;

                    if (bodyIsXml) {
                        const options = {
                            sanitize: true,
                            trim: true
                        };
                        resultJson = convert.xml2json(body, options);
                    } else {
                        resultJson = JSON.parse(body);
                    }

                    const originalSellingPrice = getNestedProperty(["displayPrice", "compareAt"], resultJson) || Infinity;
                    const minSellingPrice = getNestedProperty(["displayPrice", "min"], resultJson) || Infinity;

                    if (originalSellingPrice === Infinity) {
                        Logger.error(`Unable to parse displayPrice for ${productName}.`);
                        return;
                    }

                    if (originalSellingPrice >= minSellingPrice) {
                        Logger.log(`${productName} is still the same price, checking back later.`);
                        return;
                    }

                    /* Check if item is as cheap as the lowestThresholdPricing price */
                    if (minSellingPrice <= lowestThresholdPricing) {
                        this._sendNotification(productName, minSellingPrice);
                    } else {
                        Logger.log(`No lower price found for ${productName}.`)
                    }
                } catch(e) {
                    Logger.error(`Erorr in checking prices for ${productName}`);
                    Logger.error(e);
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