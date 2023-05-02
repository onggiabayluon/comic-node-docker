const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Attendance = new Schema({
    date : {type : String},
    user_id : {type : String}
})

module.exports = mongoose.model('Attendance', Attendance);