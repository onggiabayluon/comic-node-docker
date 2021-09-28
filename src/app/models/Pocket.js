const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');


const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};
const Pocket = new Schema({
  user_id: { type: String, require: true },
  pockets: [{
    _id: false,
    comicSlug: { type: String, require: true, index: true },
    chapters: [{type: String, require: true, index: true }],
  }]
  
  }, opts);

  module.exports = mongoose.model('Pocket', Pocket);