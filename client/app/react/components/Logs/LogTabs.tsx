import * as React from 'react';
import { ILog, LogTypes } from "./../../models/Logs/index";

interface ILogTabProps {
    logType: LogTypes;
    tab: number;
}

interface ILogTabsState {
    index: number;
}

interface ILogTabsProps {
    logType: LogTypes;
}

class LogTab extends React.PureComponent<ILogTabProps, {}> {
    render() {
        return (
            <>
                {this.props.children}
            </>
        )
    }
}

export class LogTabs extends React.PureComponent<ILogTabsProps, ILogTabsState> {
    static LogTab = (props) => <LogTab {...props} />;

    state = {
        index: 0
    };

    render() {
        return (
           <>
            {
                React.Children.map(this.props.children, (element, index) => {
                    if (this.props.logType === (element as any).props.logType) {
                        return React.cloneElement((element as any), {
                            tab: index
                        });
                    } else {
                        return null;
                    }
                })
            }
           </>
        );
    }
}