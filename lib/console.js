`
    Created by: Juan Cortez
    Date Created: August 26, 2016

    Enhancements to console.log, console.warn, console.error, and console.info
`
try{
    (() => {
        const clc = require("cli-color"),
            path = require('path'),
            mapping = {
            log: clc.blue,
            warn: clc.yellow,
            error: clc.red
        };

        ["log", "warn", "error"].forEach((method) => {
            let oldMethod = console[method].bind(console);
            console[method] = function(){
                oldMethod.apply(
                    console,
                    [mapping[method](createTimeStamp())]
                        .concat(arguments)
                );
            };
        });
        
        function createTimeStamp(){
            let date = new Date(),
                localDate = date.toLocaleDateString().replace(/\//g, "-"),
                localTime = date.toLocaleTimeString().replace(/..M$/, "");
            return `${localTime}_[${localDate}]`;
        }
    })();
} catch(e){
    console.warn(`Running on Bluemix, so don't run this file.`);
}