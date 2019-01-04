const { useEffect, useState, useReducer, Fragment } = React;

const _timerObservable = new Observable();

const Components = (() => {
    const _initialCounterState = {
        count: 0
    };

    function NotificationComponent() {
        useEffect(() => {
            _emitNotification();
        });

        return (
            <div>
                Notification API Example
            </div>
        );
    }

    function BasicUseEffectComponent() {
        const [isSubscriptionEnabled, disableSubscription] = useState(true);

        useEffect(() => {
            _timerObservable.subscribe(Logger);

            const fireInterval = 500;
            setInterval(() => {
                _timerObservable.fire("Test");
            }, fireInterval);

            if (!isSubscriptionEnabled) {
                _timerObservable.unsubscribe(Logger);
            }
        });

        return (
            <div>
                <h1>Click to disable subscription:</h1>
                <button onClick={() => disableSubscription(false)}>
                    Disable
                </button>
            </div>

        )
    }

    function BasicHook() {
        const [count, setCount] = useState(0);

        return (
            <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>
                    Click me
                </button>
            </div>
        );
    }

    function ReducerHook({ initialCount = 0 }) {
        const [state, dispatch] = useReducer(_counterReducer, {
            count: initialCount
        }, {
            type: 'reset',
            payload: initialCount
        });

        return (
            <Fragment>
                <p>Count: {state.count}</p>
                <button onClick={() => dispatch({type: 'reset'})}>
                    Reset
                </button>
                <button onClick={() => dispatch({type: 'increment'})}>
                    Increment
                </button>
                <button onClick={() => dispatch({type: 'decrement'})}>
                    Decrement
                </button>
            </Fragment>
        )
    }

    const RenderPropExample = () => (
        <RenderPropRender
            render={({firstName}) => (
                <h1>First Name: {firstName}</h1>
            )}
        />
    );

    class RenderPropRender extends React.Component {
        static names = ["Juan", "John", "Doe"];

        constructor(props) {
            super(props);

            this.state = {
                firstName: RenderPropRender.names[Math.floor(Math.random() * RenderPropRender.names.length)]
            };
        }

        render() {
            return (
                <Fragment>
                    {
                        this.props.render({
                            firstName: this.state.firstName
                        })
                    }
                </Fragment>
            );
        }
    }

    function _emitNotification() {
        if ("Notification" in window) {
            const permission = Notification.permission;

            if (permission === "denied") {
                return;
            } else if (permission === "granted") {
                return _displayNotification();
            }

            Notification.requestPermission().then(function() {
                return _displayNotification();
            });
        }
    }

    function _displayNotification(durationMs = 3000) {
        const notification = new Notification("Notification Title", {
            body: "Notification Body",
            icon: "/favicon.ico"
        });

        notification.onclick = function () {
            window.open("http://shpeaustin.mybluemix.net");
        }

        // hide notification by itself in duration ms
        setTimeout(notification.close.bind(notification), durationMs);
    }

    function _counterReducer(state, action) {
        switch (action.type) {
            case 'reset':
                return _initialCounterState;
            case 'increment':
                return {
                    count: state.count + 1
                };
            case 'decrement':
                return {
                    count: state.count - 1
                };
            default:
                return state;
        }
    }

    return {
        BasicHook,
        ReducerHook,
        RenderPropExample,
        NotificationComponent,
        BasicUseEffectComponent
    };
})();