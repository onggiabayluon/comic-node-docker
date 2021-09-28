const express = require('express');
const router = express.Router();
// Load Fetchcontroller
const Fetchcontroller = require('../app/controllers/FetchController');
const { noCache } = require('../config/header/header');

// Set Private header 
router.get('/*', noCache)

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

// Get and Auth Chapter in COMIC DETAIL PAGE
router.get('/getAuthChapter/:comicSlug/:chapterId', Fetchcontroller.getAuthChapterUI);
// Route: fetch / auth
router.get('/comicdetail/getAuthChapterList', Fetchcontroller.getAuthChapterList);
module.exports = router;
