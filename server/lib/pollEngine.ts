/*
    Helper to poll functions

    Example usage:
        const pollEngine = new PollEngine({
            fn: example,
            fnContext: this,
            pollMs: 100,
            pollEngineName: "Poll Example",
            startImmediate: false
        });

        pollEngine.startPolling();
*/
namespace Polling {
    export class PollEngine {
        private _preLog: string;
        private _fn: Function;
        private _pollMs: number;
        private _stopPoll: boolean;
        private _pollEngineName: string;
        private _started: boolean;
        private _fnContext: any;

        constructor(args) {
            const { fn, pollMs, pollEngineName, fnContext = null, startImmediate = false } = args;
            this._preLog = "<PollEngine>";
            this._fn = fn;
            this._pollMs = pollMs;
            this._stopPoll = false;
            this._pollEngineName = pollEngineName;
            this._started = false;
            this._fnContext = fnContext;
    
            if (startImmediate) {
                this._started = true;
                this.startPolling();
            }
        }
    
        startPolling() {
            this._log(`Starting ${this._pollEngineName} poll engine.`);
            this._started = true;
            this._poll();
        }
    
        stopPolling() {
            if (!this._started) {
                return;
            }
    
            this._log(`Stopping ${this._pollEngineName} poll engine.`);
            this._started = false;
            this._stopPoll = true;
        }
    
        updatePollTimeMs(pollMs) {
            if (!this._started) {
                this._log("Unable to update poll time on poll engine that hasn't started.");
                return;
            }
            this._pollMs = pollMs;
        }
    
        _log(msg) {
            console.log(`${this._preLog}: ${msg}`);
        }
    
        _poll() {
            if (this._stopPoll) {
                return;
            }
    
            this._fn.call(this._fnContext);
    
            setTimeout(this._poll.bind(this), this._pollMs);
        }
    }
}


module.exports = Polling.PollEngine;