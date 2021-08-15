const mongoose = require('mongoose');
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, MONGO_FOLDER } = require("../config");
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/${MONGO_FOLDER}?authSource=admin`
// const mongoURL = 'mongodb://localhost:27017/ducchuy2'
const autoIndex = process.env.NODE_ENV !== 'production';
async function connect() {

    try {
        //'mongodb://localhost:27017/ducchuy2'
        await mongoose.connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            autoIndex
        });
        console.log("Connect success to DB!!");
    } catch (error) {
        console.log("Connect failed to DB!!");
        
        setTimeout(connect, 5000)
    }
}

module.exports = { connect };