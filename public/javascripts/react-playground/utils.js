function Observable() {
    this.handlers = [];
}

Observable.prototype = {
    subscribe: function(fn) {
        this.handlers.push(fn);
    },
    unsubscribe: function(fn) {
        this.handlers = this.handlers.filter(item => {
                if (item !== fn) {
                    return item;
                }
            }
        )
    },
    fire: function(o, thisObj) {
        const scope = thisObj || window;
        this.handlers.forEach(item => {
            item.call(scope, o);
        })
    }
}

const Logger = function(evt) {
    console.log(evt);
}