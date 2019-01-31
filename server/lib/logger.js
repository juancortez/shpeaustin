const utils = require('./utils');
const Severity = utils.Severity;
const TelemetryLogger = require('./telemetryLogger');

class Logger {
    constructor(preLog) {
        this.preLog = preLog;
        this.telemetryLogger = TelemetryLogger.getInstance();
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
            const msg = `${this.preLog}: ${message}`;
            console[severity](msg);

            this.telemetryLogger[severity](msg);
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