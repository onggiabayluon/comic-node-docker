const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');


const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};
const Invoice = new Schema({
  user_id:    { type: String, require: true },
  comicSlug:  { type: String, require: true },
  chapter:    {
    id: false,
    chapterName:  { type: String, require: true },
    chapter_id:   { type: String, require: true },
  },
  coin:       { type: Number, require: true },
  
  }, opts);

  module.exports = mongoose.model('Invoice', Invoice);