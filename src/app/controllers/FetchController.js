const Comic     = require('../models/Comic');
const Chapter   = require('../models/Chapter');
const Comment   = require('../models/Comment');
const User   = require('../models/User');
const { singleMongooseToObject, multiMongooseToObject } =  require('../../util/mongoose');

class SiteController {

    fetchUsers(req, res, next) {
        User
        .find({}).lean()
        .select('banned role name _id')
        .then(users => res.send(users))
        .catch(next)
    }
    
    fetchSubList(req, res, next) {
        if (!req.user) return res.send({login: false})
        User
        .findOne({ _id: req.user._id}).lean()
        .select('subscribed -_id')
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
        .find({comicSlug: req.params.chapterSlug}).lean()
        .select('-image')
        .then(chapters => res.send(chapters))
        .catch(next)
    }
    fetchChapterComments(req, res, next) {
        let chapter = (req.params.chapter == 'null') ? null : req.params.chapter
        let sort = (req.query.hasOwnProperty('_sort')) ? { [req.query.column]: parseInt(req.query.type) } : { commentArr: -1 }
        let match = (req.query.hasOwnProperty('_match')) 
        ? { comicSlug: req.params.comicSlug, chapter: { $ne: null } } 
        : { comicSlug: req.params.comicSlug, chapter: chapter }
        let page = +req.body.page || 1;
        let PageSize = 10;
        let firstLimit = (req.query.hasOwnProperty('_match')) ? PageSize : 1
        let skipComment = (page - 1) * PageSize;
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
              user: singleMongooseToObject(req.user),
            })
          })
    }
}

//export (SiteController) thì lát require nhận được nó
module.exports = new SiteController();
