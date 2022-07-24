const redis = require("redis");

//Connect to redis
const redisClient = redis.createClient(
    13224, //port
    "redis-13224.c261.us-east-1-4.ec2.cloud.redislabs.com", //host
    { no_ready_check: true }
  );
  redisClient.auth("bpbAcN0vNBUHk2nza7H8i1exy9Q69PyU", function (err) {   //password
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  
  module.exports={redisClient}