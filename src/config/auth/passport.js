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
    clientID: '885722097368-aoh1lfihdgdvef92h8u0a96letbcsh6j.apps.googleusercontent.com',
    clientSecret: 'URETJgo_KhJRHmC-053NQklU',
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
    clientID: '198247612131034',
    clientSecret: 'b2fd578f561a46e92e3a4d71cdda2f31',
    callbackURL: "https://cloudimagewall.xyz/users/facebook/callback",
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

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id})
    .lean()
    .select("-password")
    .then(user => done(null, user))
    .catch(err => done(err, null))
  });
};