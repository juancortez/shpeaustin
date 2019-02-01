import * as React from 'react';
import { LogsProvider } from "./LogsProvider";
import { Log } from "./Log";

import "./../../styles/logs.less";

const logCountInterval: number = 10;
const defaultLogsToShow: number = 20;

interface ILogsContainerState {
    logsToShow: number;
}

export class LogsContainer extends React.Component<{}, ILogsContainerState> {
    state = {
        logsToShow: defaultLogsToShow
    };

    constructor(props) {
        super(props);

        this._onShowMore = this._onShowMore.bind(this);
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
                            <h2>
                                Error loading logs, please try again
                            </h2>
                        </div>
                    );
                } else if (isLoading) {
                    return (
                        <div className="logs-provider">
                            <h2>
                                Loading logs...
                            </h2>
                        </div>
                    );
                } else {
                    const { logsToShow } = this.state;
                    const filteredLogs = logs.slice(Math.max(logs.length - logsToShow, 1));

                    return (
                        <div className="logs-provider">
                            <Log logs={filteredLogs} />
                            <span onClick={this._onShowMore} className="show-more-logs dark-shpe-blue">Show more</span>
                        </div>
                    );
                }
            }}
            />
        </div>
    );
    }

    _onShowMore() {
        this.setState((prevState) => ({
            logsToShow: prevState.logsToShow + logCountInterval
        }));
    }
}