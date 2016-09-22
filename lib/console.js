`
    Created by: Juan Cortez
    Date Created: August 26, 2016

    Enhancements to console.log, console.warn, console.error
`
const Console = (() => {
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
                    .concat(formatCallerFile(getCaller()))
                    .concat(formatArguments(arguments))
            );
        };
    });

    `
        Creates a timestamp that looks like the following: 
            8:02:45_[8-27-2016]
        which represents, HH:MM:SS_[MM-DD-YYYY]
    `
    function createTimeStamp(){
        let date = new Date(),
            localDate = date.toLocaleDateString().replace(/\//g, "-"),
            localTime = date.toLocaleTimeString().replace(/..M$/, "");
        return `${localTime}_[${localDate}]`;
    }


    `
    Formats from:  { 
                        '0': 'notice: ** BOT ID:',
                        '1': 'shpebot',
                        '2': '...attempting to connect to RTM!' 
                    }
            to:
                    notice: ** BOT ID: 
                    shpebot 
                    ...attempting to connect to RTM! 

    `
    function formatArguments(args){
        let numArgs = Object.keys(args).length || 0,
            keys = Object.keys(args),
            result = "",
            onArg = 0;
        if(!!numArgs){
            keys.forEach((arg) =>{ 
                if(numArgs === 1) result = args[arg];
                else{
                    onArg++;
                    result += `${(onArg <= numArgs && onArg != 1) ? "\t\t    " : ""}${args[arg]} ${(onArg === numArgs) ? "" : "\n"}`;
                }
            });
            return result;
        } else{
            return "";
        }
    }

    function getCaller() {
        try {
            var err = new Error();
            var callerfile;
            var currentfile;

            Error.prepareStackTrace = function (err, stack) { return stack; };

            currentfile = err.stack.shift().getFileName();

            while (err.stack.length) {
                callenumber = err.stack.shift().getLineNumber();
                callerfile = err.stack.shift().getFileName();

                if(currentfile !== callerfile){
                    return {
                        lineNumber : callenumber,
                        fileName : callerfile
                    };  
                } 
            }
        } catch (err) {}
        return undefined;
    }

    function formatCallerFile(obj){
        let fileName = obj.fileName,
            lineNumber = obj.lineNumber;

        const path = require('path');
        let pathName = path.join(__dirname, '../'),
            finalPath =  fileName.replace(pathName, '');
        return `{${finalPath}}`;
    }
})();