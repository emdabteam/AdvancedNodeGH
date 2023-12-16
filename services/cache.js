const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

// const redisUrl = 'redis://127.0.0.1:6379';
// const client = redis.createClient(redisUrl);
const client = redis.createClient(keys.redis);

client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = async function (options = {}) { 
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
};


// console.log(mongoose.Query.prototype);
mongoose.Query.prototype.exec = async function () {
  console.log('I am about to run a query');

  if(!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));

  const cacheValue = await client.hget(this.hashKey, key);
  console.log(key);
  console.log(this.hashKey);

  if(cacheValue) {
    console.log('SERVING FROM CACHE');
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc) 
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
  client.expire(this.hashKey, 10);
  return result;
};

module.exports = {
  clearHash(keyHash) {
    console.log('clearHash');
    client.del(JSON.stringify(keyHash));
  }
};