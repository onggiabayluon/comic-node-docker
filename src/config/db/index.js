const mongoose = require('mongoose');
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, MONGO_FOLDER } = require("../config");
var mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/${MONGO_FOLDER}?authSource=admin`

// Localhost development
if (process.env.NODE_ENV != 'production' || process.env.NODE_ENV != 'development') {
    mongoURL = 'mongodb://localhost:27017/ducchuy2'
}

async function connect() {

    try {
        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });
        console.log("Connect success to DB!!");
    } catch (error) {
        console.log("Connect failed to DB!!");
        
        setTimeout(connect, 5000)
    }
}

module.exports = { connect };