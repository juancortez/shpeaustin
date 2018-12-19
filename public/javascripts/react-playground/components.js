const Components = (() => {
    function Hooks() {
        // Declare a new state variable, which we'll call "count"
        const [count, setCount] = React.useState(0);
    
        return (
            <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>
                    Click me
                </button>
            </div>
        );
    }

    return {
        Hooks
    };
})();