
/**
 * Module that configure winston for logging in the application
 */

let winston = require('winston');
let propertiesReader = require('properties-reader');
let propertiesInfo = propertiesReader('pricingData.properties');

let winstonFormat = winston.format.combine(
    winston.format.timestamp({ format: propertiesInfo.get('timestampFormat')}),
    winston.format.simple());


let winstonParameters = {
  file: {
    filename: propertiesInfo.get('appFile'),
    handleExceptions: true,
    json: true,
    format: winstonFormat,
    maxsize: propertiesInfo.get('appFileMaxSize'),
    maxFiles: propertiesInfo.get('appFileMaxFiles'),
    colorize: false,
  },
  errorFile: {
    level: propertiesInfo.get('errorLoggerLevel'),
    filename: propertiesInfo.get('errorFile'),
    handleExceptions: true,
    json: true,
    format: winstonFormat,
    maxsize: propertiesInfo.get('errorFileMaxSize'),
    maxFiles: propertiesInfo.get('errorFileMaxFiles'),
    colorize: false,
  },
  console: {
    level: propertiesInfo.get('debugLoggerLevel'),
    format: winstonFormat,
    handleExceptions: true,
    json: true,
    colorize: true,
  },
};


let logger = winston.createLogger({
  transports: [
    new winston.transports.File(winstonParameters.file),
    new winston.transports.File(winstonParameters.errorFile),
    new winston.transports.Console(winstonParameters.console)
  ],
  exitOnError: false,
});


module.exports = logger;