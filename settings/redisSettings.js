
/**
 * Module that configure Redis for caching info in the app
*/

const redisSettings = require('redis');
const REDIS_PORT = process.env.REDIS_PORT;
const client = redisSettings.createClient(REDIS_PORT);

module.exports = client;
