import * as React from 'react';
import * as ReactDOM from 'react-dom';

export function createElement(domNode) {
  ReactDOM.render(<App />, domNode);
}

export class App extends React.Component {
  render() {
    return (
      <div>
        <h1 className="log-info-header">React App</h1>
      </div>
    );
  }
}