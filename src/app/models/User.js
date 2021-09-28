const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//import plugin slug mongoose
const moment = require('moment-timezone');

const ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  EXTRAADMIN: 'extraAdmin'
};
const opts = {
  // set lại time zone sang asia
  timestamps: { currentTime: () => moment.tz(Date.now(), "Asia/Ho_Chi_Minh") },
};
const User = new Schema({
    name: {
      type: String,
      required: true,
      index: true
    },
    // email: {
    //   type: String,
    //   required: true
    // },
    password: {
      type: String
    },
    role: {
      type: String,
      required: true,
      default: ROLE.USER
    },
    avatar: {
      type: String,
    },
    banned: {
      type: Boolean,
      required: true,
      default: false
    },
    comment: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    },
    subscribed: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comic"
    }],
    coin: {
      type: Number,
      required: true,
      default: 0
    },

    googleId: String,
    facebookId: String,
    userCreatedAt: String,
    userUpdatedAt: String,
    
  }, opts);

  module.exports = mongoose.model('User', User);
