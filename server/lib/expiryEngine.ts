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
            this._expiryPoll.startPolling();
        }

        private _checkForExpiry () {
            this._expiry.forEach((expiry: IExpiry) => {
                const { expiryTime, keyName } = expiry;
 
                database.getCachedData(keyName, function(err, data){
                    if(err){
                        Logger.error(err.reason);
                        return;
                    }

                    // TODO: expiryTime logic
                });
            });
        }
    }
}

module.exports = ExpiryEngine.Expiry;