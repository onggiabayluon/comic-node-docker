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
      index: true,
      required: true
    },
    // email: {
    //   type: String,
    //   required: true
    // },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      default: ROLE.USER
    },
    banned: {
      type: String,
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

    googleId: { 
      type: String, 
      unique: true,
    },
    facebookId: { 
      type: String, 
      unique: true,
    },
    avatar: String,
    displayName: String,
    userCreatedAt: String,
    userUpdatedAt: String,
    
  }, opts);

  module.exports = mongoose.model('User', User);
