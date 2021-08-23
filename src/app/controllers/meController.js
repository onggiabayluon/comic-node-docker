const Comic     = require('../models/Comic');
const Chapter   = require('../models/Chapter');
const Comment   = require('../models/Comment');
const Config   = require('../models/Config');
const Category   = require('../models/Category');
const User      = require('../models/User');
const dbHelper  = require('./dbHelper')
const { singleMongooseToObject, multiMongooseToObject } = require('../../util/mongoose');
const { canViewProject, canDeleteProject } = require('../../config/permissions/comics.permission');
const { IMAGE_URL } = require('../../config/config');
class meController {

  /***** Comic Controller *****
  -3. delete Categories
  -2. Create Categories
  -1. Category List Page
  0. default page
  1. Render comic list
  2. Render Create comics
  3. Create comics
  4. Render Edit Page
  5. Update comic
  6. Destroy comic
  7. Handle Form Action Comic
  ***** Comic Controller *****/

  /***** Chapter Controller *****
  8.  Render ChapterList
  9.  Render create Chapter
  10. destroy Chapter
  11. Handle Form Action Chapter
  ***** Chapter Controller *****/

  // -3. delete Categories: [DELETE] / me / stored / category-list / destroy / :_id
  destroyCategory(req, res, next) {
    Category
    .findOne({_id: req.params._id})
    .then(category => {
      deleteCategoryInComic(category)
    })
    .then(() => {
      deleteCategoryModel(req.params._id)
      req.flash('success-message', `Xóa Category thành công !!`)
      res.redirect('/me/stored/comics/category-list')
    })
    .catch(err => next(err))

    function deleteCategoryInComic(category) {
      category.comic.forEach(comic_id => {
        Comic.findOneAndUpdate(
          { _id: comic_id },
          { $pull: { category: category._id } })
          .then()
          .catch(err => next(err))
      })
    };
    function deleteCategoryModel(category_id) {
      Category.findOneAndRemove({_id: category_id}).exec()
    };
  };
  // -2. Create Categories: [GET] / me / stored / category-list / create
  createCategories(req, res, next) {
    
    const { category } = req.body;

    checkInput(category)
    
    function checkInput(category) {
        Category
          .findOne({ name: category })
          .then(categoryExisted => {
            if (categoryExisted == null) {
              createCategories(category)
            } else {
              req.flash('error-message', `Category <${category}>  đã tồn tại`)
              res
                .status(201)
                .redirect('/me/stored/comics/category-list')
            }
      })
    };

    function createCategories(category) {
      Category
        .create({ name: category })
        .then(() => {
          req.flash('success-message', `Tạo Category thành công !!`)
          res
            .status(201)
            .redirect('/me/stored/comics/category-list')
        })
        .catch(err => next(err))
    }

  };

  // -1. Category List Page: [GET] / me / stored / category-list
  categoryListPage(req, res, next) {
    
    Category.aggregate([
      { $match: { } },
      { $project: { 
        numberOfComics: { $cond: { if: { $isArray: "$comic" }, then: { $size: "$comic" }, else: "NA"} },
        name: "$name",
        // test: { $cond: { if: { $regexMatch: { input: {$reduce: "$comic", } , regex: /test/ } }, then: "$comic", else: "$name"} },
      } }
    ])
    .then(categories => {
      res.status(200).render('me/Pages.Category.List.hbs',
      {
        layout: 'admin',
        user: singleMongooseToObject(req.user),
        categories
      })
    })
    .catch(next)
  }
  
  // 0. default: [GET] / me / stored / comics
  adminDashboard(req, res, next) {

    Promise.all([
        Comic.find({ $and: [{ title: { $exists: true } }, { chaptername: { $not: { $exists: true } } }] }).lean()
      , Comic.find({}).lean().select('view title slug').sort({view:-1}).limit(12) // desc
      , Comic.countDocuments({isPublish: true})
      , Comic.countDocuments({isPublish: false})
      , User.find({}).select('banned role name _id')
    ])

      .then(([comics, comicListView, publishedComic, pendingComic, users]) => {
        res.render('me/Dashboard.Admin.hbs',
          {
            layout: 'admin',
            publishedComic, pendingComic,
            comicListView: (comicListView),
            comics: (comics),
            users: multiMongooseToObject(users),
            user: singleMongooseToObject(req.user),
          })
      })
      .catch(next);
  }

  extraAdminDashboard(req, res, next) {

    Promise.all([Comic.find({ $and: [{ title: { $exists: true } }, { chaptername: { $not: { $exists: true } } }] }), Comic.countDocumentsDeleted()
      , User.find({})]
    )

      .then(([mangas, deletedCount]) =>
        res.render('me/Dashboard.extraAdmin.hbs',
          {
            layout: 'admin',
            deletedCount,
            user: singleMongooseToObject(req.user),
          })
      )
      .catch(next);
  }

  faqPage(req, res, next) {
    res.render('me/faqPage.hbs',
      {
        layout: 'admin',
        user: singleMongooseToObject(req.user),
      })
  }

  configBannerPage(req, res, next) {
    Config.findOne({category: 'image'}).lean()
      .then(config => {
        res.render('me/Config.banner.hbs',
          {
            layout: 'admin',
            user: singleMongooseToObject(req.user),
            title: 'Config - Banner',
            config: config,
            configString: JSON.stringify(config),
            img_url: IMAGE_URL
          })
      })
  }
  
  // 1. comic List Page: [GET] / me / stored / comics / comic-list  + (/:comicId )
  comicListPage(req, res, next) {
    var comicList = new Object()
    // Tức là role admin và route comic-list của admin
    if (req.user.role == "admin" && req.params.comicId == undefined) {
      comicList = Comic.find({})
    } else {
      // Route comic-list của user. VD: comiclist/6084e73384620a19a88780da
      comicList = Comic.find({ userId: req.params.comicId })
    }

    if (req.query.hasOwnProperty('_sort')) {
      comicList = comicList.sort({
        [req.query.column]: [req.query.type] //column=title&type=desc
      })
    }

    authGetProject(comicList, req, res, next)

    async function authGetProject(comicList, req, res, next) {
      var check = await canViewProject(req.user, comicList)
      if (!check) {
        console.log("not ok")
        res.status(401).redirect('/dashboard')
        req.flash('error-message', 'Bạn không đủ điều kiện để xem nội dung này')
      } else {
        console.log("ok")
        dbHelper.comicListPage_Pagination_Helper(comicList, req, res, next, null)
      }
    }


  }

  // 2. Render Create comics Page: [GET] / me / stored / comics / create
  createComicPage(req, res, next) {
    Category
    .find({}).lean()
    .select("_id name")
    .then(categories => {
      res.status(200).render('me/Pages.Comic.Create.hbs',
        {
          layout: 'admin',
          user: singleMongooseToObject(req.user),
          categories: categories
        })
    });
  }

  // 3. Create comics: [Post] / me / stored / comics / create [create comic]
  createComic(req, res, next) {
    dbHelper.CreateComic_Helper(req, res, next, null)
  };

  // 4. Edit Page: [GET] / me / stored /comics /:slug / edit
  comicEditPage(req, res, next) {
    dbHelper.comicEditPage_Helper(req, res, next, null)
  }
  // 5. Update comic: [GET] / me / stored / comics / :slug -> update
  updateComic(req, res, next) {
    dbHelper.UpdateComic_Helper(req, res, next, null)

  }

  // 6. Destroy comic: [DELETE] / me / stored / destroyComic / :slug
  async destroyComic(req, res, next) {
    // var comicList = new Object()
    // comicList = await Comic.findOne({ slug: req.params.slug })
    // authDeleteProject(comicList, req, res, next)

    // async function authDeleteProject(comicList, req, res, next) {
    //   var check = await canDeleteProject(req.user, comicList)
    //   if (!check) {
    //     console.log("delete not ok")
    //     res.status(401).redirect('/dashboard')
    //     req.flash('error-message', 'Bạn không đủ điều kiện để delete nội dung này')
    //   } else {
    //     console.log("delete ok")
    //     dbHelper.destroyComic_Helper(req, res, next, null)
    //   }
    // }
    dbHelper.destroyComic_Helper(req, res, next, null)

  }

  // 7. Handle Form Action Comic: [POST] / me / stored / handle-form-action-for-comic
  async handleFormActionForComics(req, res, next) {
    dbHelper.handleFormActionForComics_Helper(req, res, next, null)
  }








  // 8. Render ChapterList: [GET] / me / stored / comics / :slug / chapter-list
  chapterListPage(req, res, next) {
    var chapterList = Chapter.find({ comicSlug: req.params.slug }).lean()
    var chapterLength = Chapter.countDocuments({ comicSlug: req.params.slug })
    dbHelper.chapterListPage_Helper(chapterList, chapterLength, req, res, next, null)
    
  }

  // 9. Render create Chapter: [GET] / me / stored / comics / :slug / create-chapter
  createChapterPage(req, res, next) {
    var linkComics = req.params.slug;
    res.status(200).render('me/Pages.Chapter.Create.hbs', {
      layout: 'admin',
      linkComics,
    })
  }

  // 10. destroy Chapter
  destroyChapter(req, res, next) {
    dbHelper.destroyChapter_Helper(req, res, next, null)
  }

  // 11. Handle Form Action Chapter: [POST] / me / stored / handle-form-action-for-comic
  async handleFormActionForChapters(req, res, next) {
    dbHelper.handleFormActionForChapters_Helper(req, res, next, null)
  }

}

//export (SiteController) thì lát require nhận được nó
module.exports = new meController();
