
/**
 * Module that configure property reader object
*/

let propertiesReader = require('properties-reader');
let propertiesInfo = propertiesReader('pricingData.properties');

module.exports = propertiesInfo;
