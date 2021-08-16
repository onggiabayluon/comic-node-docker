const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const moment = require('moment-timezone');
const trimEng = require('../../config/middleware/trimEng')

const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};
function setDefaultTime() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = String(today.getFullYear());
  return ({ dd, mm, yyyy })
};

const Comic = new Schema({
  title: { type: String, trim: true },
  subtitle: { type: String, trim: true },
  titleForSearch: { type: String, trim: true },
  description: { type: String, trim: true },
  slug: { type: String, unique: true },
  author: { type: String, trim: true },
  user: {
    _id: String,
    name: String,
  },
  view: {
    totalView: { type: Number, default: 0, index: true },
    dayView: {
      view: { type: Number, default: 0, index: true },
      thisDay: { type: Number, default: new Date().getDay() }
    }
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
    chapter: String,
    updatedAt: Date,
  }],
  lastest_chapters: [{ 
    chapter: String,
    updatedAt: Date,
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

Comic.index({ title: 1 })
Comic.index(
  { title: 'text', subtitle: 'text' }, 
  {
    name: 'My text index', weights: { title: 2, subtitle: 1 }
});

// Add plugin
mongoose.plugin(slug);
Comic.plugin(mongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true
});

Comic.pre('find', function () {
  this._startTime = Date.now();
});

Comic.post('find', function () {
  if (this._startTime != null) {
    console.log('Runtime in MS: ', Date.now() - this._startTime, 'ms');
  }
});
//old Find around 50 ~ 70 ms 



//               mongoose.model('ModelName', mySchema);
module.exports = mongoose.model('Comic', Comic);

