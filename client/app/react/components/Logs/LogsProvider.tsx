import * as React from 'react';
import { ILog } from "./../../models/Logs";
import CookieProvider from "./../../../utils/CookieProvider";

interface ILogsProviderState {
    isLoading: boolean;
    logs: ILog[];
    isError: boolean;
}

interface ILogsProviderProps {
    render: Function;
}

export class LogsProvider extends React.Component<ILogsProviderProps, ILogsProviderState> {
    state = {
        isLoading: true,
        logs: [],
        isError: false
    };

    componentDidMount() {
        const credentials: string = CookieProvider.getCookie('credentials') || "";
    
        fetch(`/data/logs?credentials=${credentials}`)
          .then(data => {
            return data.json();
          })
          .then(data => {
            this.setState({
              isLoading: false,
              logs: data
            });
          })
          .catch(err => {
            console.error(err);
            this.setState({
              isLoading: false,
              isError: true
            });
          })
      }

    public render() {
        return (
            <>
                {this.props.render({
                    ...this.state
                })}
            </>
        )
    }
}