const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');


const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};

const TopView = new Schema({
  by: String,
  view: {
    totalView: { 
      type: Number, 
      index: true,
      default: 0
    },
    dayView: {
      view: { type: Number, index: true },
      thisDay: { type: Number, default: new Date().getDay() }
    }
  },
  // views: { type: Number, index: true },
  slug: { type: String },
  expiredAt: { type: Date, expires: '2m', default: Date.now }
});

// TopView.index({ views: 1 }); 

TopView.pre('find', function () {
  this._startTime = Date.now();
});

TopView.post('find', function () {
  if (this._startTime != null) {
    console.log('Runtime in MS: ', Date.now() - this._startTime, 'ms');
  }
});

module.exports = mongoose.model('TopView', TopView);

