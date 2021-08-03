const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');

const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Bangkok") },
};
const Rate = new Schema({
    comicId: {
      type: String,
      required: true
    },
    users: [{
      id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      value: { type: Number }
    }],
  }, opts);

  module.exports = mongoose.model('Rate', Rate);
