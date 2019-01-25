const utils = require('./utils');

const Severity = Object.freeze({
    "Log": "log",
    "Error": "error",
    "Info": "info"
});

class Logger {
    constructor(preLog) {
        this.preLog = preLog;
    }

    static createLogger(preLog) {
        return new Logger(preLog);
    }

    log(...messages) {
        this._logMessage(Severity.Log, messages);
    }

    error(...messages) {
        this._logMessage(Severity.Error, messages);
    }

    info(...messages) {
        this._logMessage(Severity.Info, messages);
    }

    _logMessage(severity, messages) {
        messages.forEach(message => {
            message = this._convertToString(message);
            console[severity](`${this.preLog}: ${message}`);
        });
    }

    /* If an object, try to convert it to a string */
    _convertToString(msg) {
        if (!utils.isObject(msg)) {
            return msg;
        }

        try {
            return JSON.stringify(msg);
        } catch(e) {
            return msg;
        }
    }
}

module.exports = Logger;