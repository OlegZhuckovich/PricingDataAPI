
/**
 * Module that connecting app to the database
 */

let mongoose = require('mongoose');
let winston = require('./winstonSettings');
let propertiesReader = require('properties-reader');

let propertiesInfo = propertiesReader('pricingData.properties');

mongoose.connect(propertiesInfo.get('database'));
let databaseConnection = mongoose.connection;
databaseConnection.on('error', function (){
    winston.error(propertiesInfo.get('errorConnection'));
});
databaseConnection.once('open', function (){
    winston.info(propertiesInfo.get('successConnection'));
});

module.exports = mongoose;
