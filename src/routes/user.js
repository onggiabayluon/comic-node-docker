const express = require('express');
const router = express.Router();
// Load passport
const passport = require('passport');
// Load Controller
const UserController = require('../app/controllers/UserController');
// Load Middleware
const { authRole, forwardAuthenticated } = require('../config/auth/auth');
const { noCache } = require('../config/header/header');

// Set Private header 
router.get('/*', noCache)

/** Route **/
// Login Page
router.get('/login', forwardAuthenticated, UserController.loginPage);
// Login 
router.post('/login', UserController.login);
// Logout 
router.get('/logout', UserController.logout);
// Register Page
router.get('/register', forwardAuthenticated, UserController.registerPage);
// Register 
router.post('/register', UserController.register);
// Profile
router.get('/profile', UserController.profilePage);
// buycoin
router.get('/buy-coin', UserController.buyCoinPage);
// Profile
router.post('/edit-profile', UserController.editProfile);
router.post('/change-password', UserController.changePassword);
router.post('/upload-avatar', UserController.uploadAvatar);

// Give Coin
router.post('/giveCoin', authRole('admin:extraAdmin'), UserController.giveCoin);
// unlock Chapter
router.post('/unlockChapter', UserController.unlockChapter);
// Change Role to extraAdmin or User
router.put('/changerole/:role/:userId', UserController.changeRole);
// Ban User
router.put('/changeStatus/:banType/:userId', UserController.changeBannedStatus);
// Delete User
router.delete('/deleteUser/:userId', UserController.deleteUser);

// Facebook 
router.get('/facebook/login', forwardAuthenticated, passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', UserController.loginFacebook);

// Google 
router.get('/google/login', forwardAuthenticated, passport.authenticate('google', { scope: ['profile'] }));
router.get('/google/callback', UserController.loginGoogle);

module.exports = router;
