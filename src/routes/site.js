const express = require('express');
const router = express.Router();
// Load Middleware
const { authRole, ensureAuthenticated, forwardAuthenticated } = require('../config/auth/auth');
// Load User model
const { User } = require('../app/models/User');
// Load Sitecontroller
const Sitecontroller = require('../app/controllers/SiteController');

//HOME
router.get('/', Sitecontroller.index);
router.get('/test', Sitecontroller.test);
router.get('/test2', Sitecontroller.test2);
module.exports = router;
