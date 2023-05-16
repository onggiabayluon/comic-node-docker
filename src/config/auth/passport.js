const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
// Load User model
const User = require('../../app/models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'name' }, (name , password, done) => {
      // Match user
      User
      .findOne({ name : name })
      .lean()
      .then(user => {
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
    clientID: '656609692565-8pmpjdheb354jc04ug1uc2pcjo0s1h70.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:3000/users/google/callback"
  }, function (accessToken, refreshToken, profile, done) {
    // console.log(profile)
    User
    .findOne({ googleId: profile.id })
    .lean()
    .then((googleUser) => {
      // Already have this account so its not saving
      if (googleUser) return done(null, googleUser);
      else return createGoogleUser();
      
      function createGoogleUser() {
        new User({
          name: profile.displayName,
          avatar: profile.photos[0].value,
          googleId: profile.id,
        })
        .save()
        .then(newUser => done(null, newUser))
        .catch(err => console.log(err))
      };
      
    });
  }
  ));

  // Facebook
  passport.use(new FacebookStrategy({
    clientID: '246346584729473',
    clientSecret: 'f8d941da40b6a4d280f67561af9f2ee2',
    callbackURL: "http://localhost:3000/users/facebook/callback",
    profileFields: ['id', 'displayName', 'picture.type(large)']
  },
    function (accessToken, refreshToken, profile, done) {
      // console.log(profile)
      User
      .findOne({ facebookId: profile.id })
      .lean()
      .then((facebookUser) => {
        // Already have this account so its not saving
        if (facebookUser) return done(null, facebookUser);
        else return createFacebookUser();

        function createFacebookUser() {
          new User({
            name: profile.displayName,
            avatar: profile.photos[0].value,
            facebookId: profile.id,
          })
          .save()
          .then(newUser => done(null, newUser))
          .catch(err => console.log(err))
        };

      });
    }
  ));

  /**
   * Store userId in Session
   */
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  /**
   * Later Session get retrieved the whole object via the deserializeUser
   */
  passport.deserializeUser(function(id, done) {
    User.findById(id)
    .lean()
    .select("-password")
    .then(user => done(null, user))
    .catch(err => done(err, null))
  });
};