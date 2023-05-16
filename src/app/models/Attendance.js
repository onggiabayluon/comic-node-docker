const mongoose        = require('mongoose');
const Schema          = mongoose.Schema;
//import plugin slug mongoose
const slug            = require('mongoose-slug-generator');
const mongooseDelete  = require('mongoose-delete');
const moment          = require('moment-timezone');
const trimEng         = require('../../config/middleware/trimEng')

const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};

const Attendance = new Schema({
    date : {type : String},
    user_id : {type : String}
})

module.exports = mongoose.model('Attendance', Attendance);