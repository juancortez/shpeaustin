import * as React from 'react';
import { LogTypes } from "./../../models/Logs/index";

interface ILogTabsProps {
    logType: LogTypes;
}

class LogTab extends React.PureComponent<{}, {}> {
    render() {
        return (
            <>
                {this.props.children}
            </>
        )
    }
}

export class LogTabs extends React.PureComponent<ILogTabsProps, {}> {
    static LogTab = (props) => <LogTab {...props} />;

    render() {
        return (
           <>
            {
                React.Children.map(this.props.children, (element) => {
                    if (this.props.logType === (element as any).props.logType) {
                        return React.cloneElement((element as any));
                    } else {
                        return null;
                    }
                })
            }
           </>
        );
    }
}