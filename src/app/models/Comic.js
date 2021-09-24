const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const moment = require('moment-timezone');
const Category = require('./Category')
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
    totalView: { type: Number, default: 0 },
    dayView: {
      view: { type: Number, default: 0 },
      thisDay: { type: Number, default: new Date().getDay() }
    },
    monthView: {
      view: { type: Number, default: 0 },
      thisMonth: { type: Number, default: new Date().getMonth() }
    },
    yearView: {
      view: { type: Number, default: 0 },
      thisYear: { type: Number, default: new Date().getFullYear() }
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

// Comic.pre('save', function (next) {
//   // Only run this function if category was moddified (not on other update functions)
//   if (!this.isModified('category')) return next();

//   addComicIdToCategories(this._id, this.category);
  
//   function addComicIdToCategories(comic_id, categories_id) {
//     const bulkUpdateOfCategories = []
//     for (const category_id of categories_id) {
//       bulkUpdateOfCategories.push({
//         updateOne: {
//             "filter": { _id: category_id }, 
//             "update": { $push: { comic: comic_id } },
//         }})
//     }
//     Category
//     .bulkWrite(bulkUpdateOfCategories)
//     .then(result => console.log({result: `Add Comic_id into ${result.nModified} Categories succesfully`}))
//     .catch(err => next(err))
//   };
// });

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

