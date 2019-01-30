import * as React from 'react';
import { ILog } from "./Logs";

interface ILogProps {
    logs: ILog[];
}

export class Log extends React.Component<ILogProps, {}> {
    public render() {
        return (
            <table className="shpe-logs">
                <thead>
                    <tr>
                        { this._createTableHeadings() }
                    </tr>
                </thead>
                <tbody>
                    { this._createTableBody() }
                </tbody>
            </table>
        )
    }

    private _createTableHeadings() {
        const tableHeadings = ["date", "log", "severity"];
        return (
            tableHeadings.map(heading => {
                return <th key={heading}>{heading}</th>
            })
        )
    }

    private _createTableBody() {
        const logs = this.props.logs;

        return logs.sort((a, b) => {
            return -(a.date - b.date);
        }).map((currentLog, index) => {
            const { date, log, severity } = currentLog;

            return (
                <tr className={severity} key={index}>
                    <td>{new Date(date).toLocaleString()}</td>
                    <td>{log}</td>
                    <td >{severity}</td>
                </tr>
            )
        })
        
    }
}