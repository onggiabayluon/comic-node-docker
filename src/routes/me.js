const express               = require('express');
const router                = express.Router();
//Load Controller
const meController          = require('../app/controllers/meController');
// const S3UploadController    = require('../app/controllers/S3UploadController');
const UploadController      = require('../app/controllers/UploadController');
// Load Middleware
const { authRole, ensureAuthenticated, forwardAuthenticated } = require('../config/auth/auth');

// Admin Dashboard
router.get('/stored/comics/dashboard/admin', meController.adminDashboard);
// router.get('/stored/comics/dashboard/admin', ensureAuthenticated, authRole('admin') , meController.adminDashboard);
// Extra_Admin Dashboard
router.get('/stored/comics/dashboard/extraAdmin', meController.extraAdminDashboard);
// Quyền truy cập Page
router.get('/stored/comics/faqPage', meController.faqPage);
// configBannerPage
router.get('/stored/config/banner', meController.configBannerPage);
// Upload Chapter Images 
router.post('/stored/comics/:slug/S3-multiple-upload', UploadController.multipleUpload);
// Upload Thumbnail Image 
router.post('/stored/comics/:slug/S3-thumbnail-upload', UploadController.thumbnailUpload);
// Upload Config Image
router.post('/stored/config/banner/upload', UploadController.configUpload);

/**               ***
***  COMIC ROUTE  ***
***               **/

// Page Comic Edit 
router.get('/stored/comics/:slug/edit', meController.comicEditPage);
// User Page Comic List 
router.get('/stored/comics/comic-list/:comicId', ensureAuthenticated, meController.comicListPage);
// Comic Page List 
router.get('/stored/comics/comic-list', ensureAuthenticated, authRole('admin'), meController.comicListPage);
// Category Page List
router.get('/stored/comics/category-list', meController.categoryListPage);
// Page Create Comic
router.get('/stored/comics/create', ensureAuthenticated, meController.createComicPage);
// Create Comic
router.post('/stored/comics/create', ensureAuthenticated, meController.createComic);
// Create Categories
router.post('/stored/comics/category-list/create', meController.createCategories);
// Delete Categories
router.delete('/stored/comics/destroyCategory/:_id', meController.destroyCategory);
// Update Comic
router.put('/stored/comics/:slug', meController.updateComic);
// Destroy Comic
router.delete('/stored/destroyComic/:slug', meController.destroyComic)
// Handling Comics Form 
router.post('/stored/handle-form-action-for-comics', ensureAuthenticated, meController.handleFormActionForComics);

/**               ***
*** CHAPTER ROUTE ***
***               **/

// Page Chapter List 
router.get('/stored/comics/:slug/chapter-list', meController.chapterListPage);
// Page Create Chapter
router.get('/stored/comics/:slug/create-chapter', meController.createChapterPage);;
// Destroy Chapter
router.delete('/stored/destroyChapter/:chapter_id', meController.destroyChapter);
// Handling Chapters Form
router.post('/stored/handle-form-action-for-chapters', meController.handleFormActionForChapters);




module.exports = router;