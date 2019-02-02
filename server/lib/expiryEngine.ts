import { IExpiry } from "./../models";

namespace ExpiryEngine {
    const PollEngine = require("./pollEngine");
    const Logger = require('./logger').createLogger("<ExpiryEngine>");
    const database = require('./database');

    export class Expiry {
        private _expiry: IExpiry[];
        private _expiryPoll: any;

        constructor(expiry: IExpiry[]) {
            this._expiry = expiry;

            this._expiryPoll = new PollEngine({
                fn: this._checkForExpiry,
                fnContext: this,
                pollMs: 60 * 60 * 1000, // Check expiry every hour
                pollEngineName: "ExpiryEngine"
            });
        }

        public startExpiryEngine() {
            Logger.log("Starting expiry engine...");
            this._expiryPoll.startPolling();
        }

        private _checkForExpiry() {
            Logger.info("Checking for expiry...");
            this._expiry.forEach((expiry: IExpiry) => {
                const { expiryTime, keyName } = expiry;
 
                database.getCachedData(keyName, (err, data) => {
                    if (err){
                        Logger.error(err.reason);
                        return;
                    }

                    const currentDate = +new Date();
                    const isExpiredData = data.some((dbData) => {
                        const { ts } = dbData;
                        if (this._isExpired(ts, expiryTime, currentDate)) {
                            Logger.log(`Data in ${keyName} has expired`);
                            return true;
                        }
                        return false;
                    });

                    if (isExpiredData) {
                        Logger.log(`Pruning expired data from ${keyName}`);
                        const unexpiredData = data.filter((dbData) => {
                            const { ts } = dbData;
                            return !this._isExpired(ts, expiryTime, currentDate);
                        });

                        database.setData(keyName, unexpiredData, function(err) {
                            if (err){
                                Logger.error("Error: " + err.reason);
                                return;
                            }
                            Logger.log(`Filtered out old ${keyName} data.`);
                        });
                    }
                });
            });
        }

        private _isExpired(currentTs, expiryTime, currentDate: number): boolean {
            return (currentTs + expiryTime) <= +currentDate;
        }
    }
}

module.exports = ExpiryEngine.Expiry;