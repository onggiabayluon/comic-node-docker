const redis = require("redis");
const { REDIS_URL, REDIS_PORT } = require("../config");
const client = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
});

function connect() {


    client.on('connect', function() {
        console.log('redis Connected!');
    });
    client.on("error", function(error) {
        console.error(error);
        setTimeout(connect, 5000)
    });

}

module.exports = { connect, client };