const Comic = require('../models/Comic');
const Chapter = require('../models/Chapter')
const Category = require('../models/Category')
const TimeDifferent = require('../../config/middleware/CalcTimeVnmese')
const removeVietnameseTones = require('../../config/middleware/VnameseToEng');
const trimEng = require('../../config/middleware/trimEng')
const shortid = require('shortid');
const customError = require('../../util/customErrorHandler')
const mongoose = require('mongoose');
const deleteMiddleWare = require('../middlewares/S3DeleteMiddleware');
const { singleMongooseToObject, multiMongooseToObject } = require('../../util/mongoose');


/***** Comic Controller *****
 
1. comicListPage_Pagination_Helper
2. CreateComic_Helper
3. comicEditPage_Helper
4. UpdateComic_Helper
5. destroyComic_Helper
6. handleFormActionForComics_Helper

***** Comic Controller *****/

/***** Chapter Controller *****
  7. chapterListPage_Helper
  8. destroyChapter_Helper
  9. handleFormActionForChapters_Helper
  ***** Chapter Controller *****/

// 1. comicListPage_Pagination_Helper
const comicListPage_Pagination_Helper = (exports.comicListPage_Pagination_Helper
  = (comicList, req, res, next, msg) => {
    let page = +req.query.page || 1;
    let PageSize = 10;
    let skipCourse = (page - 1) * PageSize;
    let nextPage = +req.query.page + 1 || 2;
    let prevPage = +req.query.page - 1;
    let prevPage2 = +req.query.page - 2;

    comicList
      .skip(skipCourse)
      .limit(PageSize)
      .lean()
      .then((comics) => {
        var noComics = false;
        if (comics.length == 0) { noComics = true }
        Comic.countDocuments((err, count) => {
          if (err) return next(err);
          comics.map(comic => {
            var time = TimeDifferent(comic.updatedAt)
            // console.log(time)
            comic["comicUpdateTime"] = time;
          })
          res.render('me/Pages.Comics.List.hbs',
            {
              layout: 'admin',
              noComics,
              current: page,
              nextPage,
              prevPage,
              prevPage2,
              user: singleMongooseToObject(req.user),
              pages: Math.ceil(count / PageSize),
              comics: comics,
            })
        })
      })
      .catch(err => console.log(err))
      // .catch(next);
  });


// 2. CreateComic_Helper
const CreateComic_Helper = (exports.CreateComic_Helper
  = (req, res, next, msg) => {

    const { title, description } = req.body;
    const categoriesInput = req.body.categories;
    let errors = [];
    checkInput(title, description)

    if (errors.length > 0) {
      return res.render('me/Pages.Comic.Create.hbs', {
        layout: 'admin',
        errors,
        title,
        description
      });
    } else {
      return createComic()
    }

    function checkInput(title, description) {
      if (title == '') {
        errors.push({ msg: 'Bạn chưa nhập đủ thông tin truyện' });
      }
    }
    
    function createComic() {
      const slug = removeVietnameseTones(title) //Chuyển title[tiếng việt] sang slug 
      Comic.findOne({ slug: slug })
        .then(comicExisted => {
          if (comicExisted) {
            errors.push({ msg: `Tên truyện "${comicExisted.title}" đã có, vui lòng nhập tên khác` });
            res.render('me/Pages.Comic.Create.hbs', {
              layout: 'admin',
              errors,
              title,
              description
            })
          } else {
            // TH nếu slug CHƯA có
            const comic = new Comic(req.body);
            comic.userId = req.user._id
            comic.userName = req.user.name
            comic.slug = slug;
            comic.titleForSearch = trimEng(comic.title)
            comic.category = categoriesInput
            comic
              .save()
              .then(() => handleAddCategoryModel(comic, categoriesInput))
              .then(() => {
                res
                  .status(201)
                  .redirect('/me/stored/comics/comic-list');
                req.flash('success-message', `Tạo truyện >>${title}<< thành công`)
              })
              .catch(next);
            }
          })
        .catch(next)
    };

    function handleAddCategoryModel(comic, categoriesNeedAdd) {
      if (!categoriesNeedAdd) return;
      categoriesNeedAdd.forEach(categoriesNeedAdd_id => {
        Category.findOneAndUpdate(
          { _id: categoriesNeedAdd_id }, 
          { $push: { comic: comic._id } })
          .then()
          .catch(err => next(err))
      })
    };

  });

// 3. comicEditPage_Helper
const comicEditPage_Helper = (exports.comicEditPage_Helper
  = (req, res, next, msg) => {
    Promise.all([
      Comic.findOne({ slug: req.params.slug }).lean(),
      Category.find({}).lean().select("name _id")
    ])
      .then(([comic, categories]) => {
        if (comic == null) {
          return next(new customError('comic not found', 404));
        } else {
          
          // comic.category = ["xxxxx", "xxxxx"] arr object
          // categories     = [{_id: "xxxxx", name: "acbsda"}, {.....}] arr object
          let comicCategoryString = JSON.stringify(comic.category)
          let intersection = (comicCategoryString) ? categories.filter(x => comicCategoryString.includes(x._id)) : []; // Lấy phần chung
          let intersectionIdList = intersection.map(({ _id }) => _id); // Lọc bỏ phần name ra lát mới so sánh dc
          let difference = categories.filter(x => !intersectionIdList.includes(x._id)); // Lấy phần còn lại của category mà comic không có

          // console.log('intersection: ') // Total = intersection(checked) và difference(uncheck)
          // console.log(intersection)
          // console.log('diff: ')
          // console.log(difference)

          res
            .status(200)
            .render('me/Pages.Comic.edit.hbs', {
              layout: 'admin',
              user: singleMongooseToObject(req.user),
              comic: comic,
              intersection: (intersection) ,
              difference: (difference),
            })
        }
      })
      .catch(next);
  });

// 4. UpdateComic_Helper
const UpdateComic_Helper = (exports.UpdateComic_Helper
  = async (req, res, next, msg) => {

    var newtitle = req.body.title;
    var oldSlug = req.params.slug;
    var newSlug = removeVietnameseTones(newtitle)
    var categoriesInput = req.body.categories

    var titleforsearch = trimEng(newtitle) 
    var jsonFile = req.body
    var finalReqBody = Object.assign({}, jsonFile, titleforsearch);

    
    Comic.findOne({slug: req.params.slug})
      .then(page => {
        if (newtitle !== page.title) {
          Comic.findOne({ slug: newSlug })
            .then(slugExisted => {
              // tra cái slug mới xem có slugcheck nào có chưa 
              // nếu slug mới mà có sử dụng r` thì slug cũ = slug mới + shortId
              if (slugExisted) {

                  // đổi slug cũ sang slug mới 
                  
                  req.body.slug = newSlug + '-' + shortid.generate();
                  jsonFile = req.body
                  finalReqBody = Object.assign({}, jsonFile, titleforsearch);

                  Comic.updateOne({ slug: req.params.slug }, finalReqBody)
                  .then(() => {
                    res
                      .status(200)
                      .redirect('/me/stored/comics/comic-list');
                  })
                  .then(() => updateCategory(req.body.slug))
                  .catch(next)

                Chapter.updateMany({ comicSlug: oldSlug }, { comicSlug: req.body.slug, title: newtitle })
                  .exec()
                  .catch(err => next(err))

              } else {

                // nếu slug mới chưa có sử dụng thì slug cũ = slug mới
                
                req.body.slug = newSlug;
                req.body.title = newtitle
                jsonFile = req.body
                finalReqBody = Object.assign({}, jsonFile, titleforsearch);
                Comic.updateOne({ slug: req.params.slug }, finalReqBody)
                  .then(() => {
                    res
                      .status(200)
                      .redirect('/me/stored/comics/comic-list');
                  })
                  .then(() => updateCategory(req.body.slug))
                  .catch(next)

                Chapter.updateMany({ comicSlug: oldSlug }, { comicSlug: newSlug, title: newtitle })
                .exec()
                .catch(err => next(err))
              }
            })
        } else {
          // Nếu title mới giống title cũ thì update bình thường, không update slug
          // return console.log(comic)
          updateCategory(req.params.slug)
          Comic.updateOne({ slug: req.params.slug }, finalReqBody)
            .then(() => {
              res
                .status(200)
                .redirect('/me/stored/comics/comic-list');
            })
            .catch(next)
          Chapter.updateMany({ comicSlug: oldSlug }, { comicSlug: newSlug, title: newtitle })
          .exec()
          .catch(err => next(err))
        }
      })
      .catch(next)

      // nếu comic.category.length = categoriresInput.length thì kô update
      // (optional) else xóa bỏ comic_id trong category đó (Category.findupdate)
      // else sau đó add từng category_id vào comic đó

      //EX" input: manhua, manhwa, manga
      //EX: comic: manhua
      //EX: category: manhua, manhwa, manga, action
      async function updateCategory(slug) {

        const comic = await Comic.findOne({ slug: slug })
        const comicCategory = (comic.category).toString().split(",")
        const comicCategoryLength = comic.category.length
        categoriesInput = (categoriesInput) ? categoriesInput.toString().split(",") : []
        
        // console.log(comicCategoryLength)
        // console.log(categoriesInput.length)
        if(categoriesInput.length == 0 && comicCategoryLength == 1) {
          //console.log("delete single")
          handleDeleteSingleCategoryModel(comic);
          handleDeleteComicCategory(comic);
        };

        if (categoriesInput.length < comicCategoryLength && !(categoriesInput.length == 0 && comicCategoryLength == 1)) {
          //console.log("delete multiple")
          var categoriesNeedDelete = comicCategory.filter(x => !categoriesInput.includes(x));
          handleDeleteCategoryModel(comic, categoriesNeedDelete);
          handleComicCategory(comic, categoriesInput);
        };
        if (categoriesInput.length > comicCategoryLength) {
          //console.log("add")
          var categoriesNeedAdd = categoriesInput.filter(x => !comicCategory.includes(x));
          handleAddCategoryModel(comic, categoriesNeedAdd);
          handleComicCategory(comic, categoriesInput);
        };

        function handleComicCategory(comic, categoriesInput) {
          comic.category = categoriesInput
          comic.save()
        };
        function handleDeleteComicCategory(comic) {
          comic.category = []
          comic.save()
        };
        function handleDeleteSingleCategoryModel(comic) {
          Category.findOneAndUpdate(
            { _id: comic.category[0] },
            { $pull: { comic: comic._id } })
            .then()
            .catch(err => next(err))
        };
        function handleDeleteCategoryModel(comic, categoriesNeedDelete) {
          categoriesNeedDelete.forEach(categoryToDelete_id => {
            Category.findOneAndUpdate(
              { _id: categoryToDelete_id }, 
              { $pull: { comic: comic._id } })
              .then()
              .catch(err => next(err))
          })
        };
        function handleAddCategoryModel(comic, categoriesNeedAdd) {
          categoriesNeedAdd.forEach(categoriesNeedAdd_id => {
            Category.findOneAndUpdate(
              { _id: categoriesNeedAdd_id }, 
              { $push: { comic: comic._id } })
              .then()
              .catch(err => next(err))
          })
        };
        
        
      };

  });

// 5. destroyComic_Helper
const destroyComic_Helper = (exports.destroyComic_Helper
  = (req, res, next, msg) => {

    deleteThumbnail_Images_s3().then(() => {
      return Promise.all([
      delete_Chapters_mongodb(), 
      delete_Comicmongodb_CategoryModel(),
      delete_chaptersRef()
    ]);
    }).then((args) => {
      res.status(200).redirect('back');
      req.flash('success-message', 'Xóa truyện thành công !!')
      //console.log(args)
    });
    
    function deleteThumbnail_Images_s3() {
      return new Promise((resolve, reject) => {
        // do something async
        /* -- First task -- */
        Comic.findOne({ slug: req.params.slug }, function (err, comic) {

          console.log("--1 Tiến hành Xóa comic thumbnail trên s3: ")
          if (comic.thumbnail != null) {
            let arrURL = [
              {
                url: comic.thumbnail.url + '-thumbnail.webp'
              },
              {
                url: comic.thumbnail.url + '-thumbnail-original.jpeg'
              }
            ]
            deleteMiddleWare(arrURL, function (err) {
              if (err) { return next(err) }
            }); /* -- end First task -- */
          }
          else {
            console.log(' --K có thumbnail để xóa')
          }

          console.log("--2 Tiến hành Xóa chapter images trên s3: ")
          Chapter.find({ comicSlug: req.params.slug })
            .then(chapters => {
              if (!chapters) {
                console.log(' --K có chapter images để xóa')
              }
              else {
                let arrURL = []
                chapters.map(chapter => {
                  chapter.image.forEach(image => {
                    arrURL.push({
                      url: image.url + '-large.webp'
                    },
                    {
                      url: image.url + '-medium.jpeg'
                    },
                    {
                      url: image.url + '-small.webp'
                    })
                  });
                  deleteMiddleWare(arrURL, function (err) {
                    if (err) { return next(err) }
                  });
                })
              }
            })

            //resolve bên dưới này nếu để bên trên là hàm chạy chưa hết
            //resolve như return
            .then(result => {
              resolve(result)
            })
        });

      });
    };

    function delete_Chapters_mongodb() {
      return new Promise((resolve, reject) => {
        // do something async
        /* -- Third task -- */
        console.log("--3 Tiến hành Xóa chapters trên mongodb: ")
        Chapter.deleteMany({ comicSlug: req.params.slug })
          .then((result) => {
            resolve(result);
          })
          .catch(next) /* -- end Third task -- */
      })
    };

    function delete_chaptersRef() {
      return new Promise(async (resolve, reject) => {
        const chapter = Chapter.findOne({ comicSlug: req.params.slug })
        console.log('chapter: ')
        console.log(await chapter._id)
        Comic.updateOne(
          { slug: req.params.slug },
          { $pull: { chapter: chapter._id } }
        )
        .then(result => {
          resolve(result)
        })
        .catch(next)
      })
    };

    function delete_Comicmongodb_CategoryModel() {
      return new Promise(async (resolve, reject) => {
        const comic = await Comic.findOne({ slug: req.params.slug })
        /* -- Fourth task -- */
        console.log("--4 Tiến hành Xóa comic trên mongodb: ")
        handleDeleteCategoryModel(comic, comic.category)
        comic
          .remove()
          .then((result) => {
            resolve(result)
          })
          .catch(next) /* -- end Fourth task -- */
      });
    };

    function handleDeleteCategoryModel(comic, categoriesNeedDelete) {
      if (!categoriesNeedDelete) return;
      categoriesNeedDelete.forEach(categoryToDelete_id => {
        Category.findOneAndUpdate(
          { _id: categoryToDelete_id }, 
          { $pull: { comic: comic._id } })
          .then()
          .catch(err => next(err))
      })
    };

  });

// 6. handleFormActionForComics_Helper
const handleFormActionForComics_Helper = (exports.handleFormActionForComics_Helper
  = (req, res, next, msg) => {

    const chapterExisted = true
    switch (req.body.action) {
      case 'delete':
        //comicSlugs là biến đã đặt trong html
        var comicSlugs = req.body.comicSlug;
        if (!comicSlugs) {
          req.flash('error-message', 'Bạn chưa chọn truyện')
          res.status(404).redirect('back');
        } else {
          
          delete_Thumbnail_Images_s3().then(() => {
            delete_Comic_And_CategoryModel_mongodb()
          })
          
        }

        async function delete_Thumbnail_Images_s3() {
            /* -- map comics -- */
            comicSlugs.map(comicSlug => {
              /* -- First task -- */
              Comic.findOne({ slug: comicSlug })
                .then(comic => {
                  console.log("--1 Tiến hành Xóa comic thumbnail trên s3: ")
                  if (comic.thumbnail != null) {
                    let arrURL = [
                      {
                        url: comic.thumbnail.url + '-thumbnail.webp'
                      },
                      {
                        url: comic.thumbnail.url + '-thumbnail-original.jpeg'
                      }
                    ]
                    deleteMiddleWare(arrURL, function (err) {
                      if (err) { return next(err) }
                    }) /* -- end First task -- */
                  }
                })

                /* -- Second task -- */
                console.log("--2 Tiến hành Xóa chapter images trên s3: ")
                Chapter.find({ comicSlug: comicSlug })
                  .then(chapters => {
                    if (chapters.length == 0) {
                      console.log(' --K có chapter images để xóa')
                    } else {
                      let arrURL = []
                      chapters.map(chapter => {
                        chapter.image.forEach(image => {
                          arrURL.push({
                            url: image.url + '-large.webp'
                          },
                          {
                            url: image.url + '-medium.jpeg'
                          },
                          {
                            url: image.url + '-small.webp'
                          })
                        });
                        deleteMiddleWare(arrURL, function (err) {
                          if (err) { return next(err) }
                        });
                      })
                    }
                  })/* -- End Second task -- */

              }) /* -- End map comics -- */
        };
        
        function delete_Comic_And_CategoryModel_mongodb() {
          //reg.body.comicSlug là mảng[ ]
          // xóa comic trên mongodb
          comicSlugs.forEach(async comicSlug => {
            const comic = await Comic.findOne({ slug: comicSlug })
            handleDeleteCategoryModel(comic, comic.category)
            comic
              .remove()
              .then((result) => {
                console.log(result)
              })
              .catch(next)
          });
          if (chapterExisted == true) {
            Chapter.deleteMany({ comicSlug: { $in: req.body.comicSlug } })
              .then(() => {
                res.status(200).redirect('back');
                req.flash('success-message', 'Xóa truyện thành công !!')
              })
              .catch(next)
          };
        };
        
        function handleDeleteCategoryModel(comic, categoriesNeedDelete) {
          if (!categoriesNeedDelete) return;
          categoriesNeedDelete.forEach(categoryToDelete_id => {
            Category.findOneAndUpdate(
              { _id: categoryToDelete_id }, 
              { $pull: { comic: comic._id } })
              .then()
              .catch(err => next(err))
          })
        };

        break;
      default:
        req.flash('error-message', 'Action không hợp lệ')
        res.status(404).redirect('back')
    }
  });

// 7. chapterListPage_Helper
const chapterListPage_Helper = (exports.chapterListPage_Helper
  = (chapterList, req, res, next, msg) => {
    let page = +req.query.page || 1;
    let PageSize = 10;
    let skipCourse = (page - 1) * PageSize;
    let nextPage = +req.query.page + 1 || 2;
    let prevPage = +req.query.page - 1;
    let prevPage2 = +req.query.page - 2;

    chapterList
      .select('title chapterSlug createdAt updatedAt description thumbnail comicSlug chapter')
      .skip(skipCourse)
      .limit(PageSize)
      .lean()
      .then((chapters) => {
        var noChapters = false;
        if (chapters.length == 0) { noChapters = true }
        if (chapters) {
          var linkComics = req.params.slug;
          chapters.map(chapter => {
            var time = TimeDifferent(chapter.updatedAt)
            chapter["chapterUpdateTime"] = time;
          })
          res.status(200).render('me/Pages.Chapter.List.hbs', {
            layout: 'admin',
            linkComics,
            noChapters,
            current: page,
            nextPage,
            prevPage,
            prevPage2,
            pages: Math.ceil(chapters.length / PageSize),
            chapters: chapters
          })
        }
      })
      .catch(next);
  });

// 8. destroyChapter_Helper
const destroyChapter_Helper = (exports.destroyChapter_Helper
  = (req, res, next, msg) => {

    delete_chaptersRef().then(() => {
      delete_Chapter_Images_s3().then(() => {
        delete_Chapter_mongodb()
      })
    })


    async function delete_Chapter_Images_s3() {
      Chapter.findOne({ _id: req.params.chapter_id }, function (err, currentChapter) {
        // return res.json(chapter)
        console.log("-- 1.Tiến hành Xóa chapter images trên s3" + " [" + currentChapter.chapter + "]:")
        let arrURL = []
        currentChapter.image.forEach(image => {
          arrURL.push({
            url: image.url + '-large.webp'
          },
          {
            url: image.url + '-medium.jpeg'
          },
          {
            url: image.url + '-small.webp'
          })
        });
        deleteMiddleWare(arrURL, function (err) {
          if (err) { return next(err) }
        });
      });
    };

    async function delete_Chapter_mongodb() {
      Chapter.deleteOne({ _id: req.params.chapter_id }) //slug của chapters
        .then(() => {
          res.status(200).redirect('back');
          req.flash('success-message', 'Xóa Chapter Thành Công')
        })
        .catch(next)
    };

    async function delete_chaptersRef() {
      Comic.updateOne(
        { slug: req.body.comicSlug },
        { $pull: { 
            lastest_chapters: { chapter: req.body.chapter }, 
            chapters: { chapter: req.body.chapter }
          }
        }
      ).exec()
    };


  })


// 9. handleFormActionForChapters_Helper
const handleFormActionForChapters_Helper = (exports.handleFormActionForChapters_Helper
  = async (req, res, next, msg) => {
    switch (req.body.action) {
      case 'delete':

        //chapter_ids là biến đã đặt trong html
        var chapter_ids = req.body.chapter_id;
        if (!chapter_ids) {
          req.flash('error-message', 'Bạn chưa chọn chapter')
          res.status(404).redirect('back');
        } else {

          delete_chaptersRef()
          delete_Chapter_Images_s3()
          delete_Chapter_mongodb()

        }

        async function delete_Chapter_Images_s3() {
          chapter_ids.map((chapter_id, index) => {

            delete_chaptersRef(chapter_id, index)

            Chapter.findOne({ _id: chapter_id })
              .then(currentChapter => {
                // Nếu image length > 0 thì tức là có chapter image
                if (!currentChapter) {
                  console.log(' --K có chapter để xóa')
                } else {
                  console.log("-- 2.Tiến hành Xóa chapter images trên s3" + " [" + currentChapter.chapter + "]:")
                  let arrURL = []
                  currentChapter.image.forEach(image => {
                    arrURL.push({
                      url: image.url + '-large.webp'
                    },
                    {
                      url: image.url + '-medium.jpeg'
                    },
                    {
                      url: image.url + '-small.webp'
                    })
                  });
                  deleteMiddleWare(arrURL, function (err) {
                    if (err) { return next(err) }
                  });
                }
              }).catch(next)
          })
        }

        async function delete_Chapter_mongodb() {
          Chapter.deleteMany({ _id: { $in: req.body.chapter_id } })
            .then(() => {
              res.status(200).redirect('back');
              req.flash('success-message', 'Xóa Chapter Thành Công')
            })
            .catch(next)
        };

        async function delete_chaptersRef(chapter_id, index) {
          Comic.updateOne(
            { slug: req.body.comicSlug[0] },
            { $pull: { 
              lastest_chapters: { chapter: req.body.chapter[index] }, 
              chapters: { chapter: req.body.chapter[index] }
            }
          }
          ).exec()
        };

        break;
      default:
        req.flash('error-message', 'Action không hợp lệ')
        res.status(404).redirect('back')
    }
  });