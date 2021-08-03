const express = require('express');
const router = express.Router();
// Load User model
const { User } = require('../app/models/User');
// Load Controller
const UserController = require('../app/controllers/UserController');
// Load Middleware
const { forwardAuthenticated } = require('../config/auth/auth');

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
// Change Role to extraAdmin or User
router.put('/changerole/:role/:userId', UserController.changeRole);
// Ban User
router.put('/changeStatus/:banType/:userId', UserController.changeBannedStatus);
// Delete User
router.delete('/deleteUser/:userId', UserController.deleteUser);

module.exports = router;
