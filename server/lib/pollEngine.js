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
class PollEngine {
    constructor(args) {
        const { fn, pollMs, pollEngineName, fnContext, startImmediate } = args;
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
        console.log(`${this._preLog}: Starting ${this._pollEngineName} poll engine.`);
        this._started = true;
        this._poll();
    }

    stopPolling() {
        if (!this._started) {
            return;
        }

        console.log(`${this._preLog}: Stopping ${this._pollEngineName} poll engine.`);
        this._stopPoll = true;
    }

    _poll() {
        if (this._stopPoll) {
            return;
        }

        this._fn.call(this._fnContext);

        setTimeout(this._poll.bind(this), this._pollMs);
    }
}

module.exports = PollEngine;