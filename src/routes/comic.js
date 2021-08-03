const express = require('express');
const router = express.Router();


const ComicController = require('../app/controllers/ComicController');


// comic / bookmark
router.get('/history', ComicController.historyPage);
// comic / bookmark
router.get('/bookmark', ComicController.bookmarkPage);
// comic / :comicSlug 
router.get('/:comicSlug', ComicController.comicdetailsPage);
// comic / categories 
router.get('/categories/:category', ComicController.categoriesPage);
// comic /  :comicSlug / :chapterSlug 
router.get('/:comicSlug/:chapter', ComicController.chapterdetailsPage);

// comic /  comment / fetch
router.post('/comment/fetch', ComicController.fetchMoreComments);


// comic / subscribe
router.post('/rate', ComicController.rateHandling);
// comic / subscribe
router.post('/subscribe', ComicController.subscribeHandling);
// comic / search
router.post('/search', ComicController.searchHandling);
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
