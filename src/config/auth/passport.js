const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
var mongoose = require('mongoose');
// Load User model
const User = require('../../app/models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'name' }, (name , password, done) => {
      // Match user
      User.findOne({
        name : name 
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'This user is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  // Google 
  passport.use(new GoogleStrategy({
    clientID: '885722097368-aoh1lfihdgdvef92h8u0a96letbcsh6j.apps.googleusercontent.com',
    clientSecret: 'URETJgo_KhJRHmC-053NQklU',
    callbackURL: "http://localhost:3000/users/google/callback"
  }, function (accessToken, refreshToken, profile, done) {
    console.log(profile)
    User.findOne({ googleId: profile.id }).then((googleUserExist) => {
      if (googleUserExist) {
        console.log('already have this account so its not saving')
        done(null, googleUserExist)
      } else {
        new User({
          displayname: profile.displayName,
          avatar: profile.photos[0].value,
          googleId: profile.id,
          role: 'user'
        }).save().then((newUser) => {
          console.log('new google User:' + newUser)
          done(null, newUser)
        })
      }
    });
  }
  ));

  // Facebook
  passport.use(new FacebookStrategy({
    clientID: '1494820264187159',
    clientSecret: 'e8f94ba8462024f4a4bf0c248953349e',
    callbackURL: "http://localhost:3000/users/facebook/callback",
    profileFields: ['id', 'displayName', 'picture.type(large)']
  },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile)
      User.findOne({ facebookId: profile.id }).then((facebookUserExist) => {
        if (facebookUserExist) {
          console.log('already have this account so its not saving')
          done(null, facebookUserExist)
        } else {
          new User({
            displayname: profile.displayName,
            avatar: profile.photos[0].value,
            facebookId: profile.id,
            role: 'user'
          }).save().then((newUser) => {
            console.log('new facebook User:' + newUser)
            done(null, newUser)
          })
        }

      });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};