import * as React from 'react';
import { LogsProvider } from "./LogsProvider";
import { Log } from "./Log";
import { LogTabs } from "./LogTabs";
import { LogTypes, ILog } from "./../../models/Logs/index";
import "./../../styles/logs.less";

const logCountInterval: number = 10;
const defaultLogsToShow: number = 20;

interface ILogsContainerState {
    logsToShow: number;
    logTypes: LogTypes;
}

export class LogsContainer extends React.Component<{}, ILogsContainerState> {
    state = {
        logsToShow: defaultLogsToShow,
        logTypes: LogTypes.All
    };

    constructor(props) {
        super(props);

        this._onShowMore = this._onShowMore.bind(this);
        this._onAllLogs = this._onAllLogs.bind(this);
        this._onRegularLogs = this._onRegularLogs.bind(this);
        this._onErrorLogs = this._onErrorLogs.bind(this);
        this._getLogsByType = this._getLogsByType.bind(this);
        this._getLogsToShow = this._getLogsToShow.bind(this);
        this._infoLogs = this._infoLogs.bind(this);
    }

    render() {
        return (
            <div className="logs-container">
                <h1 className="log-info-header">SHPE Austin Logs</h1>
                <LogsProvider
                    render={({ isLoading, logs, isError }) => {
                        if (isError) {
                            return (
                                <div className="logs-provider">
                                    <h3>
                                        Error loading logs, please try again
                                    </h3>
                                </div>
                            );
                        } else if (isLoading) {
                            return (
                                <div className="logs-provider">
                                    <h3>
                                        Loading logs...
                                    </h3>
                                </div>
                            );
                        } else {
                            return (
                                <div className="logs-provider">
                                    <div className="logs-button-container">
                                        <button className="btn btn-secondary" onClick={this._onAllLogs}>All</button>
                                        <button className="btn btn-secondary" onClick={this._onRegularLogs}>Regular</button>
                                        <button className="btn btn-secondary" onClick={this._onErrorLogs}>Error</button>
                                        <button className="btn btn-secondary" onClick={this._infoLogs}>Info</button>
                                    </div>

                                    <div className="log-tabs-container">
                                        <LogTabs
                                            logType={this.state.logTypes}
                                        >
                                            <LogTabs.LogTab logType={LogTypes.All}>
                                                <>
                                                    <h3 className="tab-header">All logs</h3>
                                                    {
                                                        React.cloneElement(<Log logs={this._getLogsByType(logs, LogTypes.All)}/>)
                                                    }
                                                </>
                                            </LogTabs.LogTab>
                                            <LogTabs.LogTab logType={LogTypes.Regular}>
                                                <>
                                                    <h3 className="tab-header">Regular Logs</h3>
                                                    {
                                                        React.cloneElement(<Log logs={this._getLogsByType(logs, LogTypes.Regular)}/>)
                                                    }
                                                </>
                                            </LogTabs.LogTab>
                                            <LogTabs.LogTab logType={LogTypes.Error}>
                                                <>
                                                    <h3 className="tab-header">Error Logs</h3>
                                                    {
                                                        React.cloneElement(<Log logs={this._getLogsByType(logs, LogTypes.Error)}/>)
                                                    }
                                                </>
                                            </LogTabs.LogTab>
                                            <LogTabs.LogTab logType={LogTypes.Info}>
                                                <>
                                                    <h3 className="tab-header">Info Logs</h3>
                                                    {
                                                        React.cloneElement(<Log logs={this._getLogsByType(logs, LogTypes.Info)}/>)
                                                    }
                                                </>
                                            </LogTabs.LogTab>
                                        </LogTabs>
                                        <span onClick={this._onShowMore} className="show-more-logs dark-shpe-blue">Show more</span>
                                    </div>
                                </div>
                            );
                        }
                    }}
                />
            </div>
        );
    }

    _getLogsByType(logs: ILog[], logType: LogTypes) {
        switch (logType) {
            case LogTypes.All:
                const allLogs: ILog[] = logs;
                return this._getLogsToShow(allLogs);
            case LogTypes.Error:
                const errLogs: ILog[] = logs.filter(log => log.severity === "error");
                return this._getLogsToShow(errLogs);
            case LogTypes.Regular:
                const regularLogs: ILog[] = logs.filter(log => log.severity === "log");
                return this._getLogsToShow(regularLogs);
            case LogTypes.Info:
                const infoLogs: ILog[] = logs.filter(log => log.severity === "info");
                return this._getLogsToShow(infoLogs);
            default:
                return logs;
        }
    }

    _getLogsToShow(arr: ILog[]) {
        const { logsToShow } = this.state;
        return arr.slice(Math.max(arr.length - logsToShow, 1));
    }

    _onAllLogs() {
        this.setState({
            logTypes: LogTypes.All
        });
    }

    _onRegularLogs() {
        this.setState({
            logTypes: LogTypes.Regular
        });
    }

    _onErrorLogs() {
        this.setState({
            logTypes: LogTypes.Error
        });
    }

    _infoLogs() {
        this.setState({
            logTypes: LogTypes.Info
        });
    }

    _onShowMore() {
        this.setState((prevState) => ({
            logsToShow: prevState.logsToShow + logCountInterval
        }));
    }
}