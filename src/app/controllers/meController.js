const Comic     = require('../models/Comic');
const Chapter   = require('../models/Chapter');
const Config    = require('../models/Config');
const Category  = require('../models/Category');
const Comment   = require('../models/Comment');
const User      = require('../models/User');
const ObjectID  = require('mongodb').ObjectID;
const dbHelper  = require('./dbHelper')
const removeVietnameseTones = require('../../config/middleware/VnameseToEng');
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
        user: req.user,
        categories
      })
    })
    .catch(next)
  }
  
  // 0. default: [GET] / me / stored / comics
  adminDashboard(req, res, next) {

    Promise.all([
        Comic.find({ $and: [{ title: { $exists: true } }, { chaptername: { $not: { $exists: true } } }] }).lean()
      , Comic.find({}).lean().select('view title slug').sort({"view.totalView":-1}).limit(12) // desc
      , Comic.countDocuments({isPublish: true})
      , Comic.countDocuments({isPublish: false})
      , User.find({}).select('-password').lean()
      , Category.countDocuments()
      , Category.find().select("name -_id").lean()
      , Comment.aggregate([
            {
                $match:  { }
            },
            {
                $sort: {'updatedAt': -1}
            },
            {
                //limit n document = n comments needed
                $limit: 5
            },
            {
                $unwind: "$commentArr"
            },
            {
                $sort: {'commentArr.updatedAt': -1}
            },
            {
                // comments needed
                $limit: 5
            },
            {
                $group: {
                _id: '$_id', 
                chapter:    { $first: '$chapter'    }, 
                comicSlug:  { $first: '$comicSlug'  }, 
                title:      { $first: '$title'      }, 
                commentArr: { $push: '$commentArr'  }}

            },
            {
                $project: { commentArr: 1, chapter: 1, title: 1, comicSlug: 1,  _id: 0 }
            }
        ]), 
    ])

      .then(([comics, comicListView, publishedComic, pendingComic, users, categoriesCount, categories, comments]) => {
        const firstListCate = categories.slice(0, categories.length / 2)
        const secondListCate = categories.slice(categories.length / 2 , categories.length)
        res.render('me/Dashboard.Admin.hbs',
          {
            layout: 'admin',
            publishedComic, pendingComic,
            categoriesCount: categoriesCount,
            firstListCate: firstListCate,
            secondListCate: secondListCate,
            comicListView: (comicListView),
            comics: (comics),
            users: users,
            user: req.user,
            comments: comments
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
            user: req.user,
          })
      )
      .catch(next);
  }

  faqPage(req, res, next) {
    res.render('me/faqPage.hbs',
      {
        layout: 'admin',
        user: req.user,
      })
  }

  configBannerPage(req, res, next) {
    Config.findOne({category: 'image'}).lean()
      .then(config => {
        res.render('me/Config.banner.hbs',
          {
            layout: 'admin',
            user: req.user,
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
          user: req.user,
          categories: categories
        })
    });
  }

  // 3. Create comics: [Post] / me / stored / comics / create [create comic]
  async createComic(req, res, next) {
    const errors = []
    const { title, description } = req.body
    const categoriesInput = req.body.categories
    const slug = removeVietnameseTones(title)
    const obj1 = { 
      _id : new ObjectID(),
      user: { _id: req.user._id, name: req.user.name },
      slug: slug,
      category: categoriesInput,
    }

    const obj2 = {...obj1, ...req.body}

    const comicExisted = await Comic.findOne({ slug: slug }).lean().countDocuments()

    if (!comicExisted) return createNewComic()
    else return sendError()

    function createNewComic() {
      const comic = new Comic(obj2);
      comic
        .save()
        .then(addComicIdToCategories(obj2._id, obj2.category))
        .then(() => {
          res
            .status(201)
            .redirect('/me/stored/comics/comic-list');
          req.flash('success-message', `Create Comic ${title} Successfully`)
        })
        .catch(next);
    };

    function sendError() {
      errors.push({ msg: `Comic name "${comicExisted.title}" already existed, please change to different Title` });
      res.render('me/Pages.Comic.Create.hbs', {
        layout: 'admin',
        errors,
        title,
        description
      })
    };
  
    function addComicIdToCategories(comic_id, categories_id) {
      if (!categories_id) return
      const bulkUpdateOfCategories = []
      for (const category_id of categories_id) {
        bulkUpdateOfCategories.push({
          updateOne: {
              "filter": { _id: category_id }, 
              "update": { $push: { comic: comic_id } },
          }})
      }
      Category
      .bulkWrite(bulkUpdateOfCategories)
      .then(result => console.log({result: `Add Comic_id into ${result.nModified} Categories succesfully`}))
      .catch(err => next(err))
    };
  
  };

  // 4. Edit Page: [GET] / me / stored /comics /:slug / edit
  comicEditPage(req, res, next) {
    dbHelper.comicEditPage_Helper(req, res, next, null)
  }
  // 5. Update comic: [GET] / me / stored / comics / :slug -> update
  updateComic(req, res, next) {
    const newtitle = req.body.title,
          oldSlug = req.params.slug,
          newSlug = removeVietnameseTones(newtitle),
          categoriesInput = req.body.categories,
          $comicSlug = req.params.slug

    delete req.body.categories
    
    const obj1 = { 
      slug: newSlug,
      category: categoriesInput,
    }

    const editedVersion = {...obj1, ...req.body}
    
    // Main
    if (oldSlug === newSlug) return editComic()
    else return editComicWithSlug()
    
     // Function
    async function editComicWithSlug() {
      const slugExisted = await Comic.findOne({ slug: editedVersion.slug }).lean().countDocuments()

      if (!slugExisted) return editComic() + editChapter()
      else return sendError()
    };

    async function editComic() {

      await updateCategory($comicSlug)

      Comic.updateOne({ slug: $comicSlug }, editedVersion)
        .then(result => console.log({result: `Edit ${result.nModified} Comic succesfully`}))
        .then(() => {
          req.flash('success-message', `Edit Comic ${newtitle} Successfully`)
          res.status(200).redirect('/me/stored/comics/comic-list')
        })
        .catch(next)
    };

    function editChapter() {
      Chapter.updateMany(
        { comicSlug: $comicSlug },
        { $set: { comicSlug: editedVersion.slug}})
        .then(result => console.log({result: `Edit comicSlug of ${result.nModified} Chapter succesfully`}))
        .catch(next)
    };

    function sendError() {
      res.status(200).redirect('back');
      req.flash('error-message', `Comic name "${newtitle}" already existed, please change to different name`)
    };

    async function updateCategory(slug) {

      const comic = await Comic.findOne({ slug: slug }).select("category")
      const comicCategory = (comic.category).toString().split(",")
      const comicCategoryLength = comic.category.length
      let cateInput = (categoriesInput) ? categoriesInput.toString().split(",") : []

      if(cateInput.length == 0 && comicCategoryLength == 1) {
        //console.log("delete single")
        handleDeleteSingleCategoryModel(comic);
        handleDeleteComicCategory(comic);
      };

      if (cateInput.length < comicCategoryLength && !(cateInput.length == 0 && comicCategoryLength == 1)) {
        //console.log("delete multiple")
        var categoriesNeedDelete = comicCategory.filter(x => !cateInput.includes(x));
        handleDeleteCategoryModel(comic, categoriesNeedDelete);
        handleComicCategory(comic, cateInput);
      };
      if (cateInput.length > comicCategoryLength) {
        //console.log("add")
        var categoriesNeedAdd = cateInput.filter(x => !comicCategory.includes(x));
        handleAddCategoryModel(comic, categoriesNeedAdd);
        handleComicCategory(comic, cateInput);
      };

      function handleComicCategory(comic, cateInput) {
        comic.category = cateInput
        comic.save()
      };
      function handleDeleteComicCategory(comic) {
        comic.category = []
        comic.save()
      };
      function handleDeleteSingleCategoryModel(comic) {
        Category.updateOne(
          { _id: comic.category[0] },
          { $pull: { comic: comic._id } })
          .then(result => console.log({result: `Pull ${result.nModified} Comic_id out of Category succesfully`,test: result}))
          .catch(err => console.log(err))
      };
      function handleDeleteCategoryModel(comic, categoriesNeedDelete) {
        categoriesNeedDelete.forEach(categoryToDelete_id => {
          Category.updateOne(
            { _id: categoryToDelete_id }, 
            { $pull: { comic: comic._id } })
            .then(result => console.log({result: `Pull ${result.nModified} Comic_id out of Category succesfully`,test: result}))
            .catch(err => console.log(err))
        })
      };
      function handleAddCategoryModel(comic, categoriesNeedAdd) {
        categoriesNeedAdd.forEach(categoriesNeedAdd_id => {
          Category.updateOne(
            { _id: categoriesNeedAdd_id }, 
            { $addToSet: { comic: comic._id } })
            .then(result => console.log({result: `Add ${result.nModified} Comic_id to Category succesfully`,test: result}))
            .catch(err => console.log(err))
        })
      };
    };
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
    Comic.findOne({ slug: req.params.slug }).lean()
    .select("title thumbnail -_id")
    .then(comicdoc => {
      res.status(200).render('me/Pages.Chapter.Create.hbs', {
        layout: 'admin',
        comic: comicdoc,
        linkComics,
      })
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

  setCoin(req, res, next) {
    const $chapter_id = req.body._id,
          $coinToSet = Number(req.body.coinValue),
          $date = req.body.date,
          $expiredAt = ($date) ? new Date($date).toISOString() : null
    

    const $coin = {
      required: $coinToSet,
      expiredAt: $expiredAt,
      createdAt: new Date().toISOString()
    }
    Chapter.updateOne(
      { _id: $chapter_id },
      { $set: { "coin": $coin } },
    )
    .then(result => {
      console.log(result)
      res.redirect('back')
    })
    .catch(next)
  }

}

//export (SiteController) thì lát require nhận được nó
module.exports = new meController();
