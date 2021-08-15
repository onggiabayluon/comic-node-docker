const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');


const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};
const Chapter = new Schema({
    title: { type: String },
    comicSlug: { type: String, index: true },
    chapter: { type: String, index: true },
    description: { type: String },
    chapterSlug: { type: String },
    chapterUpdateTime: { type: String },
    userId: { type: String },
    userName: { type: String },
    image: [
      {
        key: String,
        url: String,
      }
    ],
  }, opts);

  module.exports = mongoose.model('Chapter', Chapter);