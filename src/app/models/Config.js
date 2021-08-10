const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');

const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Bangkok") },
};
const Config = new Schema({
  category: String,
  slider: [{
    url: String,
    href: String,
    title: String,
    subtitle: String,
    author: String,
    description: String,
  }],
  banner: [{
    url: String,
    href: String,
    title: String,
    subtitle: String,
    author: String,
    description: String,
  }],
  banner_background: [{
    url: String,
    href: String
  }],
  banner_topright: [{
    url: String,
    href: String
  }],
  banner_botright: [{
    url: String,
    href: String
  }]

}, opts);



module.exports = mongoose.model('Config', Config);

