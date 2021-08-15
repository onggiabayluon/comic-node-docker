const mongoose        = require('mongoose');
const Schema          = mongoose.Schema;
//import plugin slug mongoose
const moment          = require('moment-timezone');
const trimEng         = require('../../config/middleware/trimEng')

const opts = { timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") }};

const Comment = new Schema({
  comicSlug: { type: String, index: true },
  title: { type: String },
  chapter: { type: String, index: true, default: null }, // chapter-1
  commentArr: [{
    //1. user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    //2. User name
    userName: { type: String },
    //3. text
    text: { type: String, trim: true },
    //4. updated time
    updatedAt: { type: Date },
    //5. reply
    reply: [{
      //5.1 user 
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      //5.1 user name
      userName: { type: String },
      //5.3 text
      text: { type: String },
      //5.4 updated time
      updatedAt: { type: Date },
    }],
      
    
  }],
}, opts);


module.exports = mongoose.model('Comment', Comment);

