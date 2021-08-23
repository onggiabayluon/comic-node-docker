const Comic     = require('../models/Comic');
const Chapter   = require('../models/Chapter');
const Comment   = require('../models/Comment');
const User      = require('../models/User');
const Rate      = require('../models/Rate');
const Category  = require('../models/Category')
const ObjectID  = require('mongodb').ObjectID;
const customError = require('../../util/customErrorHandler')
const { singleMongooseToObject, multiMongooseToObject } = require('../../util/mongoose');

// Redis
const path  = require('path');
const redis = require(path.resolve('./src/config/redis'))
const { promisify } = require("util");
const { Promise } = require('mongoose');
const { IMAGE_URL } = require('../../config/config');

class ComicController {

  historyPage(req, res, next) {
    res.status(200).render('history.hbs', {
      layout: 'home_layout',
      user: singleMongooseToObject(req.user),
    })
  };

  bookmarkPage(req, res, next) {
    User.findOne({_id: req.user._id}).lean()
    .select('-_id subscribed')
    .populate({
      path: 'subscribed',
      select: 'title slug thumbnail _id chapters',
      populate : {
        path: 'chapters',
        select: 'chapter updatedAt',
        options: {
            limit: 2,
            sort: { updatedAt: -1},
        }
      }
    })
    .then(comics => {
      let subscribedComics = comics.subscribed
      res.status(200).render('bookmark.hbs', {
        layout: 'home_layout',
        comics: subscribedComics,
        user: singleMongooseToObject(req.user),
      })
    })
    .catch(err => next(err))
  };

  categoriesPage(req, res, next) {
    let category = req.params.category
    let _find = (category != 'all') ? {name: { $regex: category, $options: 'i'}} : {}
    let _sort = (req.query.hasOwnProperty('_sort')) ? {[req.query.columnSort]: req.query.typeSort} : {_id : 1} 
    //?_sort&columnSort=_id&type=1
    let page = +req.query.page || 1;
    let PageSize = 20;
    let skipCourse = (page - 1) * PageSize;
    let nextPage = +req.query.page + 1 || 2;
    let prevPage = +req.query.page - 1;
    let prevPage2 = +req.query.page - 2;

    Promise.all([

      Category.find({}).lean()
      .select('id name'),

      Category.find(_find).lean()
      .select('-_id comic')
      .populate({
        path: 'comic',
        select: 'title slug thumbnail _id',
        options: {
          skip: skipCourse,
          limit: PageSize,
          sort: _sort,
        }
      }),

      Category.aggregate([
        {
          $match: _find,
        },
        {
          $project: {
            _id: 0 ,
            count: { $size: "$comic" }
          }
        }
      ])
      
    ])
    .then(([categoriesDoc, comicsDoc, countDoc]) => {
      if (comicsDoc.length == 0 ) return next(new customError(`Category ${category} Not found`, 404)); 
      let size = 10
      let firstCategories = categoriesDoc.slice(0, size)
      let remainingCategories = categoriesDoc.slice(size, categoriesDoc.length)
      let comics = comicsDoc.shift().comic
      let count = countDoc.shift().count
      res.status(200).render('categories.hbs', {
        layout: 'home_layout',
        firstCategories: firstCategories,
        remainingCategories: remainingCategories,
        user: singleMongooseToObject(req.user),
        comics: comics,
        current: page,
                nextPage,
                prevPage,
                prevPage2,
                pages: Math.ceil(count / PageSize),
      })
    })
    .catch(err => next(err))
  };

  comicdetailsPage(req, res, next) {
    Promise.all([
      Comic.findOne({ slug: req.params.comicSlug }).lean()
      .select('title description thumbnail slug updatedAt category chapters view rate')
      .populate('category', 'name')
    ])
      .then(([comicdoc]) => {
        if (!comicdoc) {
          return next(new customError('Not found', 404));
        }

        let rateValue = ((comicdoc.rate.rateValue / comicdoc.rate.rateCount) * 2).toFixed(2);
        let rateCount = comicdoc.rate.rateCount
        let subscribe = false
        let subscribedComic = (req.user) ? req.user.subscribed : []

        comicdoc.chapters.sort(function (a, b) { return (a.chapter > b.chapter) ? 1 : ((b.chapter > a.chapter) ? -1 : 0) });
        
        for (let i = 0; i <= subscribedComic.length; i++) {
          if (JSON.stringify(subscribedComic[i]) === JSON.stringify(comicdoc._id)) {
            subscribe = true
            break;
          }
        }
        let chaptersLength = comicdoc.chapters.length
        res.status(200).render('comic.details.hbs', {
          layout: 'comic.details_layout.hbs',
          comic: comicdoc,
          rateValue: rateValue,
          rateCount: rateCount,
          firstChapter: comicdoc.chapters[0],
          lastChapter: comicdoc.chapters[chaptersLength - 1],
          user: singleMongooseToObject(req.user),
          subscribe: subscribe,
          img_url: IMAGE_URL
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
     
      // console.log(chaptersList)
      let $thisChapterIndex = comicdoc.chapters.findIndex(x => JSON.stringify(x.chapter) === JSON.stringify(chapterdoc.chapter))
      let prevChapter = comicdoc.chapters[$thisChapterIndex - 1]
      let nextChapter = comicdoc.chapters[$thisChapterIndex + 1]
      res.status(200).render('chapter.details.hbs',
        {
          layout: 'chapter.details.layout.hbs',
          comics: comicdoc,
          chapter: chapterdoc,
          prevChapter: prevChapter,
          nextChapter: nextChapter,
          user: singleMongooseToObject(req.user),
          img_url: IMAGE_URL
        })
    };

  };

  postComment(req, res, next) {
    // if (!req.user) return res.redirect('back')
    const chapter = (req.body.isChapterComment == "true" || req.body.isChapterReply == "true") ? req.body.chapter : null
    
    //check nếu truyện đã có 
    Comment.findOne({comicSlug: req.body.comicSlug, chapter: chapter}).lean()
    .then(commentDoc => {
      if (!commentDoc) { 
        // Trường hợp Chưa có comment của truyện này => tạo mới

        return createNewComicComment()

      } else {
        // Trường hợp đã có comment của truyện này => push vô thêm

        return pushNewComment()

      }
    })
    .catch(err => next(err))

    function createNewComicComment() {
      //không trùng truyện => tạo mới
      const comment = new Comment();
      const newComicComment = {
          user_id: req.body.user_id,
          userName: req.body.user_id,
          text: req.body.text,
          updatedAt: req.body.updatedAt,
          reply: []
      }
      
      comment.title = req.body.title
      comment.comicSlug = req.body.comicSlug
      comment.chapter = chapter
      comment.commentArr.push(newComicComment)
      comment.save()
      sendStufftoClient(newComicComment);
    };

    
    function pushNewComment() {
      const newComment = {
        _id: new ObjectID(),
        user_id: req.body.user_id,
        userName: req.body.userName,
        text: req.body.text,
        updatedAt: req.body.updatedAt,
        reply: []
      }

      Comment.findOneAndUpdate(
        { comicSlug: req.body.comicSlug, "chapter": chapter},
        { $push: { [`commentArr`]: {$each: [newComment], $position: 0} } },
        {safe: true, upsert: true})
        .exec()
      
      sendStufftoClient(newComment);
    };


    function sendStufftoClient(newComment) {
      res.status(200).render('template/comment.template.hbs', {
        layout: 'fetch_layout',
        comments: newComment
      })
    };
  };
  
  destroyComment(req, res, next) {
    // if (!req.user) return res.redirect('back')
    const chapter = (req.body.isChapterComment == "true" || req.body.isChapterReply == "true") ? req.body.chapter : null
    Comment.findOne({ comicSlug: req.body.comicSlug, chapter: chapter }).lean()
      .then(commentDoc => {
        if(!commentDoc) { return next(new customError('Comment Not found', 404)); }
        return pullComment()
      })
      .catch(err => next(err))

    function pullComment() {
      Comment.updateOne(
        { comicSlug: req.body.comicSlug, chapter: chapter },
        { $pull: { [`commentArr`]: { _id: req.body.comment_id } } },
      ).exec().catch(next)

      sendStufftoClient()
    };
    function sendStufftoClient() {
      res.send({
        text: 'delete succesfully'
      })
    };
  };

  postReply(req, res, next) {
    // if (!req.user) return res.redirect('back')
    const chapter = (req.body.isChapterComment == "true" || req.body.isChapterReply == "true") ? req.body.chapter : null
    Comment.findOne({ comicSlug: req.body.comicSlug, chapter: chapter }).lean()
      .then(commentDoc => {

        return pushNewReply(commentDoc)
        
      })
      .catch(err => next(err))

      function pushNewReply(commentDoc) {
        const newReply = {
          _id: new ObjectID(),
          userName: req.body.userName,
          user_id: req.body.user_id,
          text: req.body.text,
          updatedAt: req.body.updatedAt,
        }

        const commentIndex = commentDoc.commentArr.findIndex(x => JSON.stringify(x._id) === JSON.stringify(req.body.comment_id))
        
        Comment.updateOne(
          { comicSlug: req.body.comicSlug, "chapter": chapter },
          { $push: { [`commentArr.${commentIndex}.reply`]: newReply } },
          { safe : true, upsert: true }).exec()

        sendStufftoClient(newReply, req.body.comment_id);
      };
      function sendStufftoClient(newReply, comment_id) {
        res.status(200).render('template/reply.template.hbs', {
          layout: 'fetch_layout',
          reply: newReply,
          comment_id: comment_id
        })
      };
  };

  destroyReply(req, res, next) {
    // if (!req.user) return res.redirect('back')
    const chapter = (req.body.isChapterComment == "true" || req.body.isChapterReply == "true") ? req.body.chapter : null
    Comment.findOne({ comicSlug: req.body.comicSlug, chapter: chapter }).lean()
      .then(commentDoc => {

        return pullReply(commentDoc)

      })
      .catch(err => next(err))

    function pullReply(commentDoc) {
      const commentIndex = commentDoc.commentArr.findIndex(x => JSON.stringify(x._id) === JSON.stringify(req.body.comment_id))
     
      Comment.updateOne(
        { comicSlug: req.body.comicSlug, chapter: chapter },
        { $pull: { [`commentArr.${commentIndex}.reply`]: { _id: req.body.reply_id } } },
      ).exec()

      sendStufftoClient()
    };

    function sendStufftoClient() {
      res.send({
        text: 'delete succesfully'
      })
    };
  };

  editComment(req, res, next) {
    // if (!req.user) return res.redirect('back')
    // chapter = null => edit comic
    // chapter = number => edit chapter
    const chapter = (req.body.isChapterComment == "true" || req.body.isChapterReply == "true") ? req.body.chapter : null
    
    Comment.findOne({ comicSlug: req.body.comicSlug, chapter: chapter }).lean().select('commentArr')
      .then(commentDoc => {

        if (req.body.isComicComment == 'true' || req.body.isChapterComment == 'true')
        return updateComment(commentDoc)
        
        if (req.body.isComicReply == 'true' || req.body.isChapterReply == 'true')
        return updateReply(commentDoc)
    
      })
      .catch(err => next(err))


    function updateComment(commentDoc) {

      const commentIndex = commentDoc.commentArr.findIndex(x => JSON.stringify(x._id) === JSON.stringify(req.body.comment_id))
      
      Comment.updateOne(
        { comicSlug: req.body.comicSlug, chapter: chapter},
        { $set: { [`commentArr.${commentIndex}.text`]: req.body.text } })
        .then(() => {
          res.send({comment_id: req.body.comment_id})
        })
        .catch(next)
    };

    function updateReply(commentDoc) {

      const commentIndex = commentDoc.commentArr.findIndex(x => JSON.stringify(x._id) === JSON.stringify(req.body.comment_id))
      const replyIndex = commentDoc.commentArr[commentIndex].reply.findIndex(x => JSON.stringify(x._id) === JSON.stringify(req.body.reply_id))

      Comment.updateOne(
        { comicSlug: req.body.comicSlug, chapter: chapter},
        { $set: { [`commentArr.${commentIndex}.reply.${replyIndex}.text`]: req.body.text } })
        .then(() => {
          res.send({
            comment_id: req.body.comment_id,
            reply_id: req.body.reply_id,
          })
        })
        .catch(next)
    };

  }

  fetchMoreComments(req, res, next) {
    let chapter = (req.body.isChapterComment == "true" || req.body.isChapterReply == "true") ? req.body.chapter : null
    let sort = (req.query.hasOwnProperty('_sort')) ? {[req.query.column]: parseInt(req.query.type)} : {commentArr: -1} 
    let match = (req.query.hasOwnProperty('_match')) ? {} : { comicSlug: req.body.comicSlug, chapter: chapter }
    let firstLimit = (req.query.hasOwnProperty('_match')) ? PageSize : 1

    let page = +req.body.page || 1;
    let PageSize = 10;
    let skipComment = (page - 1) * PageSize;
    Comment.aggregate([
      { $match: match },
      { $limit: firstLimit },
      { $unwind: "$commentArr" },
      { $sort: sort },
      { $skip: skipComment },
      { $limit: PageSize },
      {
        $addFields: {
          replyLength : { $size: "$commentArr.reply" }
        }
      },
      {
        $group: {
        _id: '$_id',
        title:      { $first: '$title'      }, 
        chapter :   { $first: '$chapter'    }, 
        comicSlug : { $first: '$comicSlug'  }, 
        commentArr: { $push: '$commentArr'  },
        replyLength: { $push: '$replyLength'  },}
      },
      { $sort: sort },
    ])
    .then(commentdoc => {
      if(!commentdoc) { res.send(false) }
      res.status(200).render('template/fetch.comments.template.hbs', {
        layout: 'fetch_layout',
        comments: commentdoc[0]
      })
    })
    .catch(next)
  };

  subscribeHandling(req, res, next) {
    if (!req.user) return res.send({success: false})
    
    const userId = req.body.userId
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
          res.send({ sub: true })
        })
        .catch(next)
    };
    function unSub(userId, comicId) {
      User.updateOne(
        { _id: userId },
        { $pull: { subscribed: comicId }})
        .exec()
        .then(() => {
          res.send({ unsub: true })
        })
        .catch(next)
    };
    
  };

  searchHandling(req, res, next) {
    let searchQ = req.body.data.toLowerCase()
    let limit = 20
    let $find = {$or: [ {$text: {$search: searchQ}}, {title: {$regex: searchQ}}] }
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
        .limit(limit)
        .populate({
          path: 'chapters',
          select: 'chapter _id',
          options: {
            limit: 3,
            sort: { chapter: -1},
          }
        }),
        Comic.countDocuments($find)
      ])
      .then(([results, countedResults]) => {
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
    if (!req.user) return res.send({success: false, loggedIn: false})
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
        if (result1.ok && result2.ok) res.send({success: true})
        else {res.send({success: false})}
      })
      .catch(err => log(err))
    } else { res.send({success: false}) }
  };
}

//export (SiteController) thì lát require nhận được nó
module.exports = new ComicController();
