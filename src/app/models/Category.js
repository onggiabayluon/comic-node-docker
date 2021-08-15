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
const Category = new Schema({
  name: { type: String, index: true },
  comic: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comic"
 }]
}, opts);




  //               mongoose.model('ModelName', mySchema);
  module.exports = mongoose.model('Category', Category);

