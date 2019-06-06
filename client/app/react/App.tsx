import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { LogsContainer } from "./components/Logs/LogsContainer";
import { ProgressIndicator } from "./charles_schwab/ProgressIndicator";

export function createElement(domNode) {
  ReactDOM.render(<App />, domNode);
}

export function createInterviewElement(domNode) {
  ReactDOM.render(<InterviewComponent />, domNode);
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

export class InterviewComponent extends React.Component<{}, {}> {
  render() {
    return (
      <div className="react-log-application">
        <ProgressIndicator />
      </div>
    );
  }
}

