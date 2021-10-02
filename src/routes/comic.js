const express = require('express');
const router = express.Router();


const ComicController = require('../app/controllers/ComicController');
const { noCache, cache } = require('../config/header/header');


// comic / bookmark
router.get('/history', noCache, ComicController.historyPage);
// comic / bookmark
router.get('/bookmark', noCache, ComicController.bookmarkPage);
// comic / categories 
router.get('/categories/:category', cache(1000), ComicController.categoriesPage);
// comic / :comicSlug 
router.get('/:comicSlug', cache(2400) , ComicController.comicdetailsPage);
// comic /  :comicSlug / :chapterSlug 
router.get('/:comicSlug/:chapter', cache(7200) , ComicController.chapterdetailsPage);


// comic / subscribe
router.post('/rate', ComicController.rateHandling);
// comic / subscribe
router.post('/subscribe', ComicController.subscribeHandling);
// comic / search
router.post('/search', cache(1000), ComicController.searchHandling);
// comic / comment 
router.post('/comment', ComicController.postComment);
// comic / reply
router.post('/reply', ComicController.postReply);
// comic / comment / destroyComment
router.delete('/comment/destroyComment', ComicController.destroyComment);
// comic / comment / destroyReply
router.delete('/comment/destroyReply', ComicController.destroyReply);
// comic / comment / edit
router.put('/comment/edit', ComicController.editComment);




module.exports = router;
