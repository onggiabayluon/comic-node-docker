const express = require('express');
const router = express.Router();
// Load Middleware
const { authRole, ensureAuthenticated, forwardAuthenticated } = require('../config/auth/auth');
// Load Fetchcontroller
const Fetchcontroller = require('../app/controllers/FetchController');

// Route: fetch / comics /:comicSlug / :chapter / comments
router
.get('/comic/:comicSlug/:chapter/comments', Fetchcontroller.fetchComments)
.post('/comic/:comicSlug/:chapter/comments', Fetchcontroller.fetchComments);
// Route: fetch / comics / :chapterSlug
router.get('/comics/:chapterSlug', Fetchcontroller.fetchChapters);
// Route: fetch / comics
router.get('/comics', Fetchcontroller.fetchComics);
// Route: fetch / users
router.get('/users', Fetchcontroller.fetchUsers);
// Route: fetch / sublist
router.get('/sublist', Fetchcontroller.fetchSubList);
// Route: fetch / auth
router.get('/getAuth', Fetchcontroller.getAuth);
// Route: fetch / bookmarkContents
router.post('/bookmarkContents', Fetchcontroller.fetchBookmarkContents);
// Route: fetch / getSubsbribeStatus
router.post('/getSubsbribeStatus', Fetchcontroller.getSubsbribeStatus);
module.exports = router;
