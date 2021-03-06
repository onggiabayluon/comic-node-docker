const mongoose        = require('mongoose');
const Schema          = mongoose.Schema;
//import plugin slug mongoose
const moment          = require('moment-timezone');
const trimEng         = require('../../config/middleware/trimEng')

const opts = { timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") }};

const Comment = new Schema({
  comicSlug: { type: String, require: true, index: true },
  title: { type: String, require: true },
  chapter: { type: String, require: true, index: true, default: null }, // chapter-1
  commentArr: [{
    //1. user
    userId: { type: String, require: true },
    //2. User name
    userName: { type: String, require: true },
    //2. User avatar
    avatar: { type: String },
    //3. text
    text: { type: String, require: true, trim: true },
    //4. updated time
    updatedAt: { type: Date },
    //5. reply
    reply: [{
      //5.1 user 
      userId: { type: String, require: true },
      //5.1 user name
      userName: { type: String, require: true },
      //5.1 user avatar
      avatar: { type: String },
      //5.3 text
      text: { type: String, require: true },
      //5.4 updated time
      updatedAt: { type: Date },
    }],
      
    
  }],
}, opts);


module.exports = mongoose.model('Comment', Comment);

