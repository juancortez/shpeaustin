import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CookieProvider from "./../utils/CookieProvider";

export function createElement(domNode) {
  ReactDOM.render(<App />, domNode);
}

export class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const credentials: string = CookieProvider.getCookie('credentials') || "";

    fetch(`/data/logs?credentials=${credentials}`)
      .then(data => {
        return data.json();
      })
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      })
  }

  render() {
    return (
      <div>
        <h1 className="log-info-header">React App</h1>
      </div>
    );
  }
}