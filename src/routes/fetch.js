const express = require('express');
const router = express.Router();
// Load Middleware
const { authRole, ensureAuthenticated, forwardAuthenticated } = require('../config/auth/auth');
// Load Fetchcontroller
const Fetchcontroller = require('../app/controllers/FetchController');

// Route: fetch / comics /:comicSlug / :chapter / comments
router.get('/comic/:comicSlug/:chapter/comments', Fetchcontroller.fetchChapterComments);
// Route: fetch / comics / :chapterSlug
router.get('/comics/:chapterSlug', Fetchcontroller.fetchChapters);
// Route: fetch / comics
router.get('/comics', Fetchcontroller.fetchComics);
// Route: fetch / users
router.get('/users', Fetchcontroller.fetchUsers);
// Route: fetch / sublist
router.get('/sublist', Fetchcontroller.fetchSubList);

module.exports = router;
