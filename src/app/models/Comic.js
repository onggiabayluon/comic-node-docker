const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const moment = require('moment-timezone');
const trimEng = require('../../config/middleware/trimEng')

const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Bangkok") },
};
function setDefaultTime() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = String(today.getFullYear());
  return ({ dd, mm, yyyy })
};

const Comic = new Schema({
  description: { type: String, trim: true },
  title: { type: String, trim: true },
  titleForSearch: { type: String, trim: true },
  videoId: { type: String },
  author: { type: String },
  userId: { type: String },
  userName: { type: String },
  slug: { type: String },
  comicUpdateTime: { type: String },
  view: {
    totalView: { type: Number, default: 0 },
    dayView: {
      thisDay: { type: String, default: setDefaultTime().dd },
      view: { type: Number, default: 0 }
    },
    monthView: {
      thisMonth: { type: String, default: setDefaultTime().mm },
      view: { type: Number, default: 0 }
    },
    yearView: {
      thisYear: { type: String, default: setDefaultTime().yyyy },
      view: { type: Number, default: 0 }
    },
  },
  isPublish: {
    type: Boolean,
    default: true,
  },
  isFinish: {
    type: Boolean,
    default: true,
  },
  thumbnail: {
    key: String,
    url: String,
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter"
  }],
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }],
  rate: {
    rateCount: { type: Number, default: 0 },
    rateValue: { type: Number, default: 0 },
  }
}, opts);


// Add plugin
mongoose.plugin(slug);
Comic.plugin(mongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true
});


//               mongoose.model('ModelName', mySchema);
module.exports = mongoose.model('Comic', Comic);

