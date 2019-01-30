import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Logs, ILogsProps, ILog } from "./components/Logs";
import CookieProvider from "./../utils/CookieProvider";
import "./styles/logs.less";

export function createElement(domNode) {
  ReactDOM.render(<App />, domNode);
}

interface AppState {
  isLoading: boolean;
  logs: ILog[];
  isError: boolean;
}

export class App extends React.Component<{}, AppState> {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      logs: [],
      isError: false
    };
  }

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
        this.setState({
          isLoading: false,
          isError: true
        });
      })
  }

  render() {
    const { isLoading, logs, isError } = this.state;

    const logProps: ILogsProps = {
      logs,
      isLoading,
      isError
    };

    return (
      <div className="react-log-application">
        <h1 className="log-info-header">SHPE Austin Logs</h1>
        <Logs {...logProps} />
      </div>
    );
  }
}