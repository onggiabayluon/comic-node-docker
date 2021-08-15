const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');

const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};
const Config = new Schema({
  category: { type: String, index: true},
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

Config.pre('findOne', function () {
  this._startTime = Date.now();
});

Config.post('findOne', function () {
  if (this._startTime != null) {
    console.log('Runtime in MS: ', Date.now() - this._startTime, 'ms');
  }
});

module.exports = mongoose.model('Config', Config);

