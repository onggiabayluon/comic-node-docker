const Comic     = require('../models/Comic');
const Chapter   = require('../models/Chapter');
const Comment   = require('../models/Comment');
const User      = require('../models/User');
const Rate      = require('../models/Rate');
const Category  = require('../models/Category')
const ObjectID  = require('mongodb').ObjectID;
const customError = require('../../util/customErrorHandler');
const { okToModifyThisComment, okToModifyThisReply } = require('../middlewares/comments.middleware.js') 
// Redis
const path  = require('path');
const redis = require(path.resolve('./src/config/redis'))
const { promisify } = require("util");
const { Promise } = require('mongoose');
const { 
  IMAGE_URL
  , HOME_TITLE
  , HOME_DESCRIPTION
  , HOME_KEYWORDS
  , HOME_URL
  , HOME_SITENAME
  , DETAIL_PAGE_DESCRIPTION,
  IMAGE_URL_HTTP} = require('../../config/config');

class ComicController {

  historyPage(req, res, next) {
    let scripts = [
      'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js',
      '/js/othersPage/historyPage.scripts.js'
    ]
    let meta = {
      title: 'History - ' + HOME_SITENAME,
      home_description: 'History Comic ' + HOME_SITENAME,
      home_keywords: HOME_KEYWORDS,
      home_url: HOME_URL,
      home_sitename: HOME_SITENAME,
    }
    res.status(200).render('history.hbs', {
      layout: 'utility_layout.hbs',
      user: req.user,
      scripts: scripts,
      meta
    })
  };

  bookmarkPage(req, res, next) {
    const scripts = [
      '/js/othersPage/bookmarkPage.scripts.js',
      '/js/utilityScripts/message.scripts.js',
      '/js/utilityScripts/subscribe.scripts.js'
    ]
    const meta = {
      title: 'Followed Comic' + HOME_SITENAME,
      home_description: 'Followed Comic ' + HOME_SITENAME,
      home_keywords: HOME_KEYWORDS,
      home_url: HOME_URL,
      home_sitename: HOME_SITENAME,
      detail_page_description: DETAIL_PAGE_DESCRIPTION,
      image_url_http: IMAGE_URL_HTTP
    }

    const renderWithoutUserAuth = () => {
      res.status(200).render('bookmark.hbs', {
        layout: 'utility_layout.hbs',
        scripts: scripts,
        meta,
        img_url: IMAGE_URL
      })
    };

    const renderWithUserAuth = () => {
      User.findOne({ _id: req.user._id }).lean()
        .select('-_id subscribed')
        .populate({
          path: 'subscribed',
          select: 'title slug thumbnail _id chapters updatedAt',
          populate: {
            path: 'chapters',
            select: 'updatedAt',
            options: {
              limit: 2,
              sort: { updatedAt: -1 },
            },
            // match: { chapter: { $ne: undefined } }
          },
        })
        .then(subscribedComics => {
          res.status(200).render('bookmark.hbs', {
            layout: 'utility_layout.hbs',
            sublist: subscribedComics,
            img_url: IMAGE_URL,
            user: req.user,
            scripts: scripts,
            meta
          })
        })
        .catch(err => next(err))
    };

    if (!req.user) return renderWithoutUserAuth()
    else return renderWithUserAuth()
    
  };

  categoriesPage(req, res, next) {
    const category = req.params.category,
          _order = req.query.order,
          _column = req.query.column

    const page = +req.query.page || 1,
          PageSize = 40,
          nameSize = 10,
          skipCourse = (page - 1) * PageSize,
          nextPage = (+req.query.page + 1 || 2),
          prevPage = +req.query.page - 1,
          prevPage2 = +req.query.page - 2

    const queryAll = (category === 'all') ? true : false
    const $find = (category !== 'all') ? {name: { $regex: category, $options: 'i'}} : {}
    const $sort = (req.query.hasOwnProperty('_sort')) ? {[_column]: Number(_order)} : {_id: 1} 
    const sortUrl = (req.query.hasOwnProperty('_sort')) ? `&_sort&column=${_column}&order=${_order}` : '';
    //?page=1&_sort&column=updatedAt&order=-1
    // Example: $sort = {view.totalView: -1}
    const meta = {
      title: 'Categories - ' + HOME_SITENAME,
      home_description: 'Genres, Categories of all comics, mangas at' + HOME_SITENAME,
      home_keywords: "genres, categories, " + HOME_KEYWORDS,
      home_url: HOME_URL,
      home_sitename: HOME_SITENAME,
    }

    main()
    .then(([[categoriesName, error1], [sortedList, error2], [countOfList, error3]]) => {
      if (error1 || error2 || error3) return next(new customError((error1 || error2 || error3), 401))
      let firstBatch = categoriesName.slice(0, nameSize)
      let secondBatch = categoriesName.slice(nameSize, categoriesName.length)
      let scripts = [
        '/js/utilityScripts/LazyLoader.js',
        '/js/othersPage/categoryPage.scripts.js'
      ]
      res.setHeader('Cache-Control', 'public, max-age=1000');
      res.status(200).render('categories.hbs', {
        layout: 'utility_layout.hbs',
        firstCategories: firstBatch,
        remainingCategories: secondBatch,
        user: req.user,
        comics: sortedList,
        current: page,
        nextPage,
        prevPage,
        prevPage2,
        sortUrl,
        pages: Math.ceil(countOfList / PageSize),
        scripts: scripts,
        img_url: IMAGE_URL,
        meta
      })
    })
    .catch(err => console.log(err))

    async function main() {
      try {
        const categoriesName = getCategoriesName()
        const sortedList = getSortedList()
        const countOfList = getCountOfList()
        return await Promise.all([categoriesName, sortedList, countOfList])

      } catch (err) { console.log(err) }
    };


    async function getCategoriesName () {
      return Category
        .find({})
        .lean()
        .select('id name')
        .then(result => { return [result, null] })
        .catch(err => { return [null, err] })
    };

    async function getSortedList () {
      if (queryAll) return queryByComic()
      else return queryByCategory()

      function queryByComic() {
        return Comic
        .find({})
        .sort($sort)
        .select('-description -chapters -category')
        .skip(skipCourse)
        .limit(PageSize)
        .lean()
        .then(result => { return [result, null]  })
        .catch(err => { return [null, err] })
      };
      function queryByCategory() {
        return Category
        .find($find)
        .select('-_id comic')
        .populate({
          path: 'comic',
          select: '-description -chapters -category',
          options: {
            skip: skipCourse,
            limit: PageSize,
            sort: $sort,
          }
        })
        .lean()
        .then(result => { return [result.pop().comic, null]  })
        .catch(err => { return [null, err] })
      };
      
    };

    async function getCountOfList () {
      if (queryAll) return countAllComic()
      else return countComicsInCategory()

      function countAllComic() {
        return Comic
        .countDocuments({})
        .then(result => {  return [result, null] })
        .catch(err => { return [null, err] })
      };

      function countComicsInCategory() {
        return Category
        .aggregate([
          { $match: $find },
          { $sort : $sort },
          { $project: {
              _id: 0 ,
              count: { $size: "$comic" }
          }}
        ])
        .then(result => { return [result.pop().count, null] })
        .catch(err => { return [null, err] })
      };

    };

  };

  comicdetailsPage(req, res, next) {
    Promise.all([
      Comic
      .findOne({ slug: req.params.comicSlug })
      .lean()
      .populate('category', 'name')
    ])
      .then(([comicdoc]) => {
        if (!comicdoc) {
          return next(new customError('Not found', 404));
        }

        let meta = {
          home_title: HOME_TITLE,
          home_description: HOME_DESCRIPTION,
          home_keywords: HOME_KEYWORDS,
          home_url: HOME_URL,
          home_sitename: HOME_SITENAME,
          detail_page_description: DETAIL_PAGE_DESCRIPTION,
          image_url_http: IMAGE_URL_HTTP
        }
        let rateValue = ((comicdoc.rate.rateValue / comicdoc.rate.rateCount)).toFixed(2);
        let rateCount = comicdoc.rate.rateCount

        if (comicdoc?.chapters) comicdoc.chapters.sort(function (a, b) { return (a.chapter > b.chapter) ? 1 : ((b.chapter > a.chapter) ? -1 : 0) });
        
        let chaptersLength = (comicdoc?.chapters) ? comicdoc.chapters.length : 0 
        let firstChapter = (comicdoc?.chapters) ? comicdoc.chapters[0] : 0 
        let lastChapter = (comicdoc?.chapters) ? comicdoc.chapters[chaptersLength - 1] : 0 
        res.setHeader('Cache-Control', 'public, max-age=7200');
        res.status(200).render('comic.details.hbs', {
          layout: 'comic.details_layout.hbs',
          comic: comicdoc,
          rateValue: rateValue,
          rateCount: rateCount,
          firstChapter: firstChapter,
          lastChapter: lastChapter,
          user: req.user,
          img_url: IMAGE_URL,
          meta
        })
      })
      .catch(next)
  };

  chapterdetailsPage(req, res, next) {
    var userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    Promise.all([
      Comic.findOne({ slug: req.params.comicSlug })
      .lean()
      .select('-category -description -lastest_chapters'),
      Chapter.findOne({ comicSlug: req.params.comicSlug, chapter: req.params.chapter }).lean(),
    ])
      .then(([comicdoc, chapterdoc]) => {
        if (!chapterdoc || !comicdoc) {
          return next(new customError('Not found', 404));
        }
        
        setRedisKey(userIp).then(results => console.log(results))

        renderChapterView(comicdoc, chapterdoc)
      })
      .catch(err => next(err))

    const setRedisKey = async (userIp) => {

      var chapter = req.params.chapter.replace(/chapter-/i, "c")
      var hllIp = `${userIp}:${chapter}`
      var hllKey = [`count:${req.params.comicSlug}`, `${hllIp}`]
      var setResult = await promisify(redis.client.pfadd).bind(redis.client)(hllKey);

      return { Success: `Set ${setResult} Key (${hllKey}) Successfully` }
    };

    function renderChapterView(comicdoc, chapterdoc) {

      //sort to make sure when chapters get deleted then this btn wont callapse
     
      comicdoc.chapters.sort(function (a, b) { return (a.chapter > b.chapter) ? 1 : ((b.chapter > a.chapter) ? -1 : 0) });
     
      let $thisChapterIndex = comicdoc.chapters.findIndex(x => JSON.stringify(x.chapter) === JSON.stringify(chapterdoc.chapter).replace("chapter-", ""))
      let currentChapter = comicdoc.chapters[$thisChapterIndex]
      let prevChapter = comicdoc.chapters[$thisChapterIndex - 1]
      let nextChapter = comicdoc.chapters[$thisChapterIndex + 1]
      let meta = {
        home_title: HOME_TITLE,
        home_description: HOME_DESCRIPTION,
        home_keywords: HOME_KEYWORDS,
        home_url: HOME_URL,
        home_sitename: HOME_SITENAME,
        detail_page_description: DETAIL_PAGE_DESCRIPTION,
        image_url_http: IMAGE_URL_HTTP
      }
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 1 month
      res.status(200).render('chapter.details.hbs',
        {
          layout: 'chapter.details.layout.hbs',
          comics: comicdoc,
          chapter: chapterdoc,
          currentChapter: currentChapter,
          prevChapter: prevChapter,
          nextChapter: nextChapter,
          user: req.user,
          img_url: IMAGE_URL,
          meta
        })
    };

  };

  postComment(req, res, next) {
    if (!req.user) return next(new customError("You have not logged In yet", 401))

    const reqUserId   = req.user._id,
          reqUserName = req.user.name,
          reqUserAvatar = req.user.avatar,
          isComicDetailPage = req.body.isComicDetailPage,
          comments    = [] 
    const chapter = (isComicDetailPage) ? null : req.body.chapter
    
    const newComment = {
      _id       : new ObjectID(),
      userId    : reqUserId,
      userName  : reqUserName,
      avatar    : reqUserAvatar,
      text      : req.body.text,
      updatedAt : new Date().toISOString(),
      reply     : []
    }

    comments.push({commentArr: [newComment]})

    const handlingPush = async () => {
      try {

        const [pushResult, error1]  = await pushNewComment()
        if (error1) throw new customError(error1, 404)

        return { message: `Push ${pushResult} comment successfully`, status: 200 }

      } catch (err) { next(err) }
    };

    const pushNewComment = async () => {
      return Comment
        .findOneAndUpdate(
          { comicSlug: req.body.comicSlug, "chapter": chapter },
          { $push: { [`commentArr`]: { $each: [newComment], $position: 0 } } },
          { safe: true, upsert: true, new: true })
        .then(result => {
          if (!result) return [null, "Error happen when push comment in db"]
          else return [1, null]
        })
        .catch(err => {
          return [null, err]
        })
    };

    handlingPush()
    .then(result => {
      // console.log(result)
      if(!result) return; 
      else res.status(200).render('template/comment.template.hbs', {
        layout: 'fetch_layout',
        comments: comments,
        user: req.user
      })
    })
    .catch(err => console.log(err))
    
  };
  
  postReply(req, res, next) {
    if (!req.user) return next(new customError("You have not logged In yet", 401))

    const isComicDetailPage = req.body.isComicDetailPage,
          chapter           = (isComicDetailPage) ? null : req.body.chapter,
          reqUserId         = req.user._id,
          reqUserName       = req.user.name,
          reqUserAvatar     = req.user.avatar,
          clientcomicSlug   = req.body.comicSlug,
          clientComment_id  = req.body.comment_id,
          reply             = []
          // $find             = { comicSlug: clientcomicSlug, chapter: chapter },
          // $match            = { commentArr : { $elemMatch : { _id : clientComment_id } } }
    
    const newReply = {
      _id       : new ObjectID(),
      userName  : reqUserName,
      userId    : reqUserId,
      avatar    : reqUserAvatar,
      text      : req.body.text,
      updatedAt : new Date().toISOString(),
    }

    reply.push(newReply)

    const handlingPush = async () => {
      try {
        const [pushResult, error2]  = await pushNewReply()
        if (error2) throw new customError(error2, 500)

        return { message: `Push ${pushResult} reply successfully`, status: 200 }

      } catch (err) { next(err) }
    };

    

    const pushNewReply = async () => {
      return Comment
        .updateOne(
          { comicSlug: clientcomicSlug, "commentArr._id": clientComment_id, chapter: chapter },
          { $push: { "commentArr.$.reply": newReply } },
          { safe : true, upsert: true })
        .then(result => {
          if (!result) return [null, "Error happen when push new reply to db"]
          else return [1, null]
        })
        .catch(err => {
          return [null, err]
        })
    };

    handlingPush()
    .then(result => {
      // console.log(result)
      if(!result) return; 
      else res.status(200).render('template/reply.template.hbs', {
        layout: 'fetch_layout',
        reply: reply,
        comment_id: clientComment_id,
        user: req.user
      })
      
    })
    .catch(err => console.log(err))
    
  };

  destroyComment(req, res, next) {
    if (!req.user) return next(new customError("You have not logged In yet", 401))

    const clientComicSlug   = req.body.comicSlug,
          clientChapter     = req.body.chapter,
          clientComment_id  = req.body.comment_id,
          userRequest       = req.user,
          isComicDetailPage = req.body.isComicDetailPage

    const $find = (isComicDetailPage)
      ? { comicSlug: clientComicSlug, chapter: null }
      : { comicSlug: clientComicSlug, chapter: clientChapter }
    
    // retrieved only qureried element in array
    const $match = { commentArr : { $elemMatch : { _id : clientComment_id } } }

    const handlingDestroy = async () => {
      try {

        const [commentDoc, error1]  = await getCommentDoc()
        if (error1) throw new customError(error1, 404)

        const [ok, error2] = await authUserId(commentDoc)
        if (error2) throw new customError(error2, 403)

        const [deleteResult, error3] = await pullComment()
        if (error3) throw new customError(error3, 500)
        
        return { message: `Delete ${deleteResult} comment successfully`, status: 200 }

      } catch (err) { 
        next(err)
      }
    };

    const getCommentDoc = async () => {
      return Comment
      .findOne($find,$match)
      .lean()
      .then(commentDoc => {
        if (!commentDoc) return [null, "comment not existed"]
        else return [commentDoc, null]
      })
      .catch(err => {
        return [null, err]
      })
    };

    const authUserId = async (commentDoc) => {
      const [ok, error] = okToModifyThisComment(commentDoc, userRequest, clientComment_id)
      if (error) return [null, error]
      if (!ok)   return [null, "You Dont have permission to delete this Comment"]
      else return [ok, null]
    };

    const pullComment = async () => {
      return Comment
      .updateOne(
        { comicSlug: clientComicSlug, chapter: clientChapter },
        { $pull: { [`commentArr`]: { _id: clientComment_id } } },
      )
      .then(updateResult => {
        if (updateResult.nModified === 0) return [null, "Error happen when delete comment in db"]
        else return [updateResult.nModified, null]
      })
      .catch(err => {
        return [null, err]
      })
    };

    handlingDestroy()
      .then(result => {if(!result) return; else res.send(result);})
      .catch(err => console.log(err))
  };

  destroyReply(req, res, next) {
    if (!req.user) return next(new customError("You have not logged In yet", 401))
    
    const clientComicSlug   = req.body.comicSlug,
          clientChapter     = req.body.chapter,
          clientComment_id  = req.body.comment_id,
          clientReply_id    = req.body.reply_id,
          userRequest       = req.user,
          isComicDetailPage = req.body.isComicDetailPage

    const $find = (isComicDetailPage)
      ? { comicSlug: clientComicSlug, chapter: null }
      : { comicSlug: clientComicSlug, chapter: clientChapter }
    
    // retrieved only qureried element in array
    const $match = { commentArr : { $elemMatch : { "reply._id" : clientReply_id } } }
    
    const handlingDestroy = async () => {
      try {

        const [commentDoc, error1]  = await getCommentDoc()
        if (error1) throw new customError(error1, 404)

        const [ok, error2] = await authUserId(commentDoc)
        if (error2) throw new customError(error2, 403)

        const [deleteResult, error3] = await pullReply()
        if (error3) throw new customError(error3, 500)
        
        return { message: `Delete ${deleteResult} Reply successfully`, status: 200 }
      } catch (err) { next(err) }
    };

    const getCommentDoc = async () => {
      return Comment
      .findOne($find,$match)
      .lean()
      .then(commentDoc => {
        if (!commentDoc) return [null, "Reply not existed"]
        else return [commentDoc, null]
      })
      .catch(err => { return [null, err] })
    };

    const authUserId = async (commentDoc) => {
      const [ok, error] = okToModifyThisReply(commentDoc, userRequest, clientComment_id, clientReply_id)
      if (error) return [null, error]
      if (!ok)   return [null, "You Dont have permission to delete this Comment"]
      else return [ok, null]
    };

    const pullReply = async () => {
      return Comment
      .updateOne(
        { comicSlug: clientComicSlug, "commentArr._id": clientComment_id, chapter: clientChapter, },
        { $pull: { "commentArr.$.reply": { _id: clientReply_id } } },
      )
      .then(updateResult => {
        if (updateResult.nModified === 0) return [null, "Error happen when delete Reply in db"]
        else return [updateResult.nModified, null]
      })
      .catch(err => { return [null, err] })
    };

    handlingDestroy()
      .then(result => {if(!result) return; else res.send(result);})
      .catch(err => console.log(err))
  };

  editComment(req, res, next) {
    if (!req.user) return next(new customError("You have not logged In yet", 401))
    const clientComicSlug   = req.body.comicSlug,
          clientComment_id  = req.body.comment_id,
          clientReply_id    = req.body.reply_id,
          clientText        = req.body.text,
          isComicDetailPage = req.body.isComicDetailPage,
          userRequest       = req.user,
          isComment         = req.body.isComment,
          message           = (isComment) ? 'comment' : 'reply',
          chapter           = (isComicDetailPage) ? null : req.body.chapter,
          $find             = { comicSlug: req.body.comicSlug, chapter: chapter }

    const $sendData = (req.body.isComment === true)
    ? { 
      comment_id: clientComment_id,
      text: clientText
    }
    : {
      comment_id: clientComment_id,
      reply_id: clientReply_id,
      text: clientText
    }

    const handlingUpdate = async () => {
      try {

        const [commentDoc, error1]  = await getCommentDoc()
        if (error1) throw new customError(error1, 404)

        const [ok, error2] = await authUserId(commentDoc)
        if (error2) throw new customError(error2, 403)

        const [updateResult, error3] = await update(commentDoc)
        if (error3) throw new customError(error3, 500)

        return { message: `Update ${updateResult} ${message} successfully`, status: 200 }

      } catch (err) { next(err) }
    };

    const getCommentDoc = async () => {
      return Comment
      .findOne($find)
      .lean()
      .then(commentDoc => {
        if (!commentDoc) return [null, "CommentDoc not existed"]
        else return [commentDoc, null]
      })
      .catch(err => { return [null, err] })
    };

    const authUserId = async (commentDoc) => {
      const [ok, error] = (isComment === true)
      ? okToModifyThisComment(commentDoc, userRequest, clientComment_id)
      : okToModifyThisReply(commentDoc, userRequest, clientComment_id, clientReply_id)
      
      if (error) return [null, error]
      if (!ok)   return [null, "You Dont have permission to delete this Comment"]
      else return [ok, null]
    };
    
    const update = async (commentDoc) => {
      
      const commentIndex = commentDoc.commentArr.findIndex(x => JSON.stringify(x._id) === JSON.stringify(clientComment_id))
      const replyIndex = commentDoc.commentArr[commentIndex]?.reply.findIndex(x => JSON.stringify(x._id) === JSON.stringify(clientReply_id))
      
      const $query = { comicSlug: clientComicSlug, chapter: chapter }
      const $set   = (req.body.isComment === true)
      ? { $set: { [`commentArr.${commentIndex}.text`]: clientText } }
      : { $set: { [`commentArr.${commentIndex}.reply.${replyIndex}.text`]: clientText } }
      
      return Comment
        .updateOne(
          $query,
          $set,
        )
        .then(updateResult => {
          if (updateResult.nModified === 0) return [null, "Error happen when Set Comment/Reply in db"]
          else return [updateResult.nModified, null]
        })
        .catch(err => { return [null, err] })
        
    };

    handlingUpdate()
    .then(result => {
      if(!result) return; 
      else {
        Object.assign($sendData, result)
        res.send($sendData)
      } 
    })
    .catch(err => console.log(err))
    
  };

  subscribeHandling(req, res, next) {
    if (!req.user) return next(new customError("You have not logged In yet", 401))
    
    const userId = req.user._id
    const comicId = req.body.comicId

    if (req.body.subscribeHandling == 'sub') {
      return Sub(userId, comicId)
    } 
    if (req.body.subscribeHandling == 'unsub') {
      return unSub(userId, comicId)
    }

    function Sub(userId, comicId) {
      User.updateOne(
        { _id: userId },
        { $addToSet: { subscribed: comicId }})
        .then(() => {
          res.send({ sub: true, status: 200, message: 'Subscribe successfully' })
        })
        .catch(err => {
          console.log(err)
          next(err)
        })
    };
    function unSub(userId, comicId) {
      User.updateOne(
        { _id: userId },
        { $pull: { subscribed: comicId }})
        .exec()
        .then(() => {
          res.send({ unsub: true, status: 200, message: 'UnSubscribe successfully' })
        })
        .catch(err => {
          console.log(err)
          next(err)
        })
    };
    
  };

  searchHandling(req, res, next) {
    let searchQ = req.body.data.toLowerCase()
    let limit = 20
    let $find = {$or: [ {$text: {$search: searchQ}}, {title: {$regex: searchQ, $options: 'i'}}] }
    let $meta = { score : { $meta: "textScore" } }
    if (searchQ.length > 0) {
      Promise.all([
        Comic
        .find(
          $find,
          $meta
        )
        .sort($meta)
        .lean()
        .select('title author slug thumbnail chapters -_id')
        .limit(limit),
        Comic.countDocuments($find)
      ])
      .then(([results, countedResults]) => {

        if (results?.chapters) results.chapters.sort(function (a, b) { return (a.chapter > b.chapter) ? 1 : ((b.chapter > a.chapter) ? -1 : 0) });
        var leftover = (countedResults > limit) ? countedResults - limit : 0
        var isEmpty = (results.length == 0) ? true : false
        res.render('template/search.template.hbs', {
          layout: 'fetch_layout',
          comics: results,
          empty: isEmpty,
          leftover: leftover,
          img_url: IMAGE_URL
        });
      })
    }

  };


  async rateHandling(req, res, next) {
    // If LoggedIn
    if (!req.user) return next(new customError("You have not logged In yet", 401))
    const $userId = req.user._id
    const $comicId = req.body.comicId
    const $rateVal = req.body.rateVal


    // Handling Rate
    var ratedBefore = await Rate.findOne({'users.id' : $userId, 'comicId' : $comicId}).countDocuments()
    if (!ratedBefore) {

      Promise.all([
        Rate.updateOne(
          { comicId: $comicId }, 
          { $push: { users: { id: $userId,  value: $rateVal} } },
          { upsert: true }
        ),
        Comic.updateOne(
          { "_id": $comicId }, 
          { $inc: { 'rate.rateCount': 1, 'rate.rateValue': $rateVal } },
          { timestamps: false }
        )
      ])
      .then(([result1, result2]) => {
        if (result1.ok && result2.ok) res.send({success: true, status: 200, message: "Rating successfully"})
        else return next(new customError("someshit happening on server", 500))
      })
      .catch(err => {
        console.log(err)
        next(err)
      })
    } else { return next(new customError("Not allow to rate second time", 405)) }
  };
}

//export (SiteController) thì lát require nhận được nó
module.exports = new ComicController();
