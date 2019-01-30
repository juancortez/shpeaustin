const { Severity } = require('./utils');
const uuid = require('node-uuid');

class TelemetryLogger {
    constructor() {
        this._uniqueId = uuid.v1();
        this._preLog = "<<TelemetryLogger>>";
        this._maxLogs = 1000;
        this._logs = [];
        this._flushTimeoutMs = 30 * 1000;
        this._dbKey = "logs";
        this._db = null;
        this._flushPoll();
    }

    flush() {
        this._flush();
    }

    setDatabase(db) {
        this._db = db;
    }

    log(message) {
        this._logs.push({
            ...this._baseMessage(message),
            severity: Severity.Log
        });
    }

    error(message) {
        this._logs.push({
            ...this._baseMessage(message),
            severity: Severity.Error
        });
    }

    info(message) {
        this._logs.push({
            ...this._baseMessage(message),
            severity: Severity.Log
        });
    }

    _flushPoll() {
        this._flush();
        setTimeout(this._flushPoll.bind(this), this._flushTimeoutMs);
    }

    _flush() {
        if (this._logs.length > 0 && this._db) {
            this._db.getCachedData(this._dbKey, (err, data) => {
                if(!!err){
                    console.error(err.reason);
                    return;
                }

                let logs = [...data, ...this._logs];
                
                if (logs.length > this._maxLogs) {
                    logs = _removeElementsFromStart(logs);
                }

                this._db.setData(this._dbKey, logs, (err) => {
                    if(err){
                        console.error("Error: " + err.reason);
                        return;
                    }

                    this._logs = [];
                    console.log("Successfully flushed logs to database.");
                });
            });
        }
    }

    _removeElementsFromStart(arr) {
        const arrLength = arr.length;
        
        if(arrLength > this._maxLogs) {
            const remainingElements = arrLength - this._maxLogs;
            const numToRetain = arrLength - remainingElements;

            return arr.splice(remainingElements, numToRetain);
        }
    }

    _baseMessage(message) {
        return {
            id: this._uniqueId,
            log: message,
            date: +new Date()
        };
    }
}

let instance;
module.exports = {
    getInstance() {
        if (!instance) {
            instance = new TelemetryLogger();
        }

        return instance;
    }
};