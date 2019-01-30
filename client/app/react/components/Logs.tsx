import * as React from 'react';
import { Log } from "./Log";

export interface ILogsProps {
    logs: ILog[] | [];
    isLoading: boolean;
    isError: boolean;
}

export interface ILog {
    date: number;
    id: string;
    log: string;
    severity: string;
}

export class Logs extends React.Component<ILogsProps, {}> {
    public render() {
        const { isLoading, isError, logs } = this.props;

        if (isError) {
            return (
                <div className="logs-container">
                    <h2>
                        Error loading logs, please try again
                    </h2>
                </div>
            );
        } else if (isLoading) {
            return (
                <div className="logs-container">
                    <h2>
                        Loading logs...
                    </h2>
                </div>
            );
        } else {
            return (
                <div className="logs-container">
                    <Log logs={logs} />
                </div>
            );
        }
    }
}