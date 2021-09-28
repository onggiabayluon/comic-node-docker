const Comic = require('../models/Comic');
const Chapter = require('../models/Chapter');
const Comment = require('../models/Comment');
const Pocket = require('../models/Pocket');
const User = require('../models/User');
const moment     = require('moment-timezone')
const customError = require('../../util/customErrorHandler');
const { singleMongooseToObject, multiMongooseToObject } = require('../../util/mongoose');
const { IMAGE_URL } = require('../../config/config');

class SiteController {


  getAuthChapterList(req, res, next) {
    const $slug         = req.query.comicSlug,
          $user_id      = req.user._id

    const $find = { "user_id": $user_id }
    const $match = { pockets: { $elemMatch: { comicSlug: $slug } } }

    Pocket
    .findOne($find, $match)
    .lean()
    .then(pocketDoc => {
      res.send(pocketDoc.pockets.pop().chapters)
    })
  };

  getAuthChapterUI(req, res, next) {
    const $noRender = req.query.noRender 
    if ($noRender) return res.send({message: "Auth Successfully", status: 418, withoutLazyload: true})
    if (!req.user) return next(new customError("User not logged In yet", 404, true))
    else return getAndAuthChapter()
    
    // Fucntion: auth and get
    function getAndAuthChapter () {
      const $slug     = req.params.comicSlug,
            $chapter_id  = req.params.chapterId,
            $chapterName = req.query.chapterName,
            $user_id  = req.user._id  

      const $find     = { "user_id": $user_id, "pockets.comicSlug" : $slug }
      const $match    = { "pockets": { $elemMatch : { "chapters": $chapter_id  } } }

      Promise.all([
        // Auth: Pocket findOne
        Pocket.findOne($find, $match).lean(),
        // Get: Chapter findOne 
        Chapter.findOne({ comicSlug: $slug, chapter: $chapterName }).lean(),
      ])
        .then(([pocketDoc, chapterdoc]) => {

          const isFree  = ((chapterdoc.coin.required === 0) || moment(chapterdoc.coin.expiredAt).isBefore())
          const isBought = (pocketDoc?.pockets !== undefined)

          if ( isFree || isBought ) return renderChapterUI(chapterdoc)
          else return next(new customError("Chapter is not Free and User Not unlock it yet", 423, true))
        })
        .catch(next)
    };

    // Function: rendered Warning
    function getRenderedWarning () {
      res.status(200).render('template/chapter.detail.template.hbs', {
        layout: 'fetch_layout',
        isFree: false,
      })
    };

    function renderChapterUI (chapters) {
      res.status(200).render('template/chapter.detail.template.hbs', {
        layout: 'fetch_layout',
        isFree: true,
        chapter: chapters,
        img_url: IMAGE_URL,
      })
    };

  };

  fetchBookmarkContents(req, res, next) {
    if (!req.user) return renderLocalData()
    else return renderBookmarkData()

    function renderLocalData() {
      res.status(200).render('template/history_bookmark.template.hbs', {
        layout: 'fetch_layout',
        isLoggedIn: false,
        historyItems: req.body
      })
    };

    function renderBookmarkData() {
      const userBookmarks = (req.user.subscribed) ? req.user.subscribed : []

      if (userBookmarks.length == 0) return res.send({ message: "false", status: 404 });
      else return findBookmarkedComic()

      function findBookmarkedComic() {
        Comic
          .find({ _id: { $in: userBookmarks } })
          .lean()
          .select("-category -description -lastest_chapters")
          .then(subList => {
            res.status(200).render('template/history_bookmark.template.hbs', {
              layout: 'fetch_layout',
              isLoggedIn: true,
              sublist: subList,
              img_url: IMAGE_URL
            })
          })
          .catch(err => console.log(err))
      };

    };
  }

  getAuth(req, res, next) {

    res.status(200).render('template/auth.template.hbs', {
      layout: 'fetch_layout',
      user: req.user
    })
  }

  getSubsbribeStatus(req, res, next) {
    if (!req.user) return res.send({ login: false })

    let subscribe = false,
      subscribedComic = req.user.subscribed,
      clientComic_id = req.body.comicId,
      subLength = subscribedComic?.length

    for (let i = 0; i <= subLength; i++) {
      if (JSON.stringify(subscribedComic[i]) === JSON.stringify(clientComic_id)) {
        subscribe = true
        break;
      }
    }


    res.send({
      isSub: subscribe,
      status: 200,
      message: 'You had subscribed this comic'
    })
  }

  fetchUsers(req, res, next) {

    User
      .find({}).lean()
      .select('-password')
      .then(users => res.send(users))
      .catch(next)
  }

  fetchSubList(req, res, next) {
    if (!req.user) return res.send({ login: false })

    User
      .findOne({ _id: req.user._id }).lean()
      .select('subscribed -_id')
      .populate('subscribed')
      // .then(subList => console.log(subList))
      .then(subList => res.send(subList))
      .catch(next)
  }

  fetchComics(req, res, next) {

    Comic
      .find({}).lean()
      .select('-userId')
      .then(comics => res.send(comics))
      .catch(next)
  }

  fetchChapters(req, res, next) {

    Chapter
      .find({ comicSlug: req.params.chapterSlug }).lean()
      .select('-image')
      .then(chapters => res.send(chapters))
      .catch(next)
  }

  fetchComments(req, res, next) {
    let chapter = (req.params.chapter == 'null') ? null : req.params.chapter
    let sort = (req.query.hasOwnProperty('_sort')) ? { [req.query.column]: parseInt(req.query.type) } : { commentArr: -1 }
    let match = (req.query.hasOwnProperty('_match'))
      ? { comicSlug: req.params.comicSlug, chapter: { $ne: null } }
      : { comicSlug: req.params.comicSlug, chapter: chapter }
    let page = +req.body.page || 1;
    let PageSize = 10;
    let firstLimit = (req.query.hasOwnProperty('_match')) ? PageSize : 1
    let skipComment = (page - 1) * PageSize;
    let withUIContainer = (page == 1) ? true : false;

    Comment.aggregate([
      { $match: match },
      { $limit: firstLimit },
      {
        $addFields: {
          maxComment: { $size: "$commentArr" }
        }
      },
      { $unwind: "$commentArr" },
      { $sort: sort },
      { $skip: skipComment },
      { $limit: PageSize },
      {
        $addFields: {
          replyLength: { $size: "$commentArr.reply" },
        }
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          chapter: { $first: '$chapter' },
          comicSlug: { $first: '$comicSlug' },
          maxComment: { $first: '$maxComment' },
          commentArr: { $push: '$commentArr' },
          replyLength: { $push: '$replyLength' },
        }
      },
      { $sort: sort },
    ])
      .then(commentdoc => {

        res.render('template/commentBox.hbs',
          {
            layout: 'fetch_layout.hbs',
            comments: commentdoc,
            user: req.user,
            withUIContainer: withUIContainer
          })
      })
      .catch(err => console.log(err))
  }
}

//export (SiteController) thì lát require nhận được nó
module.exports = new SiteController();
