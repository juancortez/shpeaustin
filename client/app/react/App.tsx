import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { LogsContainer } from "./components/Logs/LogsContainer";

export function createElement(domNode) {
  ReactDOM.render(<App />, domNode);
}

export class App extends React.Component<{}, {}> {
  render() {
    return (
      <div className="react-log-application">
        <LogsContainer />
      </div>
    );
  }
}