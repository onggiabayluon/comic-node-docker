const express = require('express');
const router = express.Router();
// Load Middleware
// Load User model
const { cache } = require('../config/header/header');
// Load Sitecontroller
const Sitecontroller = require('../app/controllers/SiteController');

//HOME
router.get('/', cache(1000), Sitecontroller.index);
router.get('/test', Sitecontroller.test);
router.get('/test2', Sitecontroller.test2);
module.exports = router;
