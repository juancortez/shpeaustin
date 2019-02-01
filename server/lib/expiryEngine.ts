import { IExpiry } from "./../models";

namespace ExpiryEngine {
    const { PollEngine } = require("./pollEngine");

    export class Expiry {
        private _expiry: IExpiry[];

        constructor(expiry: IExpiry[]) {
            this._expiry = expiry;

            new PollEngine()
        }

        public _checkForExpiry () {

        }
    }
}

module.exports = {
    Expiry: ExpiryEngine.Expiry,

}