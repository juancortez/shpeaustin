const merge = require("webpack-merge");
const common = require("./webpack.common");

const environmentParam = _getParam("--env");
console.log(`Running a ${environmentParam} build.`);

switch (environmentParam) {
    case 'production':
         const prodWebpack = require("./webpack.prod");
         module.exports = merge(common(environmentParam), prodWebpack);
         break;
    case 'development':
    default:
        const devWebpack = require("./webpack.dev");
        module.exports = merge(common(environmentParam), devWebpack);
}

function _getParam(param) {
   const argument = process.argv.find(arg => {
      return arg.indexOf(param) >= 0;
   }) || "";

   if (argument) {
      return argument.split("=")[1];
   }

   return argument;
}