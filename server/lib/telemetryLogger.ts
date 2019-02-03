namespace Telemetry {
    const { Severity } = require('./utils');
    const uuid = require('node-uuid');
    const PollEngine = require('./pollEngine');
    
    export class TelemetryLogger {
        private _uniqueId: string;
        private _maxLogs: number;
        private _logs: any[];
        private _flushTimeoutMs: number;
        private _dbKey: string;
        private _db: any;

        constructor() {
            this._uniqueId = uuid.v1();
            this._maxLogs = 1000;
            this._logs = [];
            this._flushTimeoutMs = 30 * 1000;
            this._dbKey = "logs";
            this._db = null;
    
            new PollEngine({
                fn: this._flush,
                fnContext: this,
                pollMs: this._flushTimeoutMs,
                pollEngineName: "TelemetryPollEngine",
                startImmediate: true
            });
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
                severity: Severity.Info
            });
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
                        logs = this._removeElementsFromStart(logs);
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
}

let instance;
module.exports = {
    getInstance() {
        if (!instance) {
            instance = new Telemetry.TelemetryLogger();
        }

        return instance;
    }
};