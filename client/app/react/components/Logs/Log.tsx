import * as React from 'react';
import { ILog } from "./../../models/Logs";

interface ILogProps {
    logs: ILog[];
}

interface ILogState {
    search: string;
}

export class Log extends React.Component<ILogProps, ILogState> {
    private _idInputId: string = "search-logs";

    constructor(props) {
        super(props);

        this._handleInputChange = this._handleInputChange.bind(this);
    }

    state = {
        search: ''
    };

    public render() {
        return (
            <>
                <div className="search-log-container">
                    <input
                        id={this._idInputId}
                        placeholder="Search logs..."
                        value={this.state.search}
                        onChange={this._handleInputChange}
                    />
                </div>
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
            </>
        )
    }

    private _handleInputChange(evt) {
        const search = evt.target.value;

        this.setState({
            search
        });
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
        const { search } = this.state;

        return logs.sort((a, b) => {
            return -(a.date - b.date);
        }).filter(currentLog => {
            const logToLower = currentLog.log.toLocaleLowerCase();
            const searchTerm = search.toLocaleLowerCase();

            return logToLower.indexOf(searchTerm) >= 0;
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