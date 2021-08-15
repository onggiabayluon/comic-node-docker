const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');

const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};
const Rate = new Schema({
    comicId: {
      type: String,
      index: true,
      required: true,
    },
    users: [{
      id: { 
        index: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      value: { type: Number }
    }],
  }, opts);

  module.exports = mongoose.model('Rate', Rate);
