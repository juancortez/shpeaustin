import * as React from 'react';
import { LogsProvider } from "./LogsProvider";
import { Log } from "./Log";

import "./../../styles/logs.less";

export class LogsContainer extends React.Component<{}, {}> {
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
                return (
                    <div className="logs-provider">
                        <Log logs={logs} />
                    </div>
                );
            }
          }}
        />
      </div>
    );
  }
}