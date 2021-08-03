const Comic     = require('../models/Comic');
const Chapter   = require('../models/Chapter');
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
}

//export (SiteController) thì lát require nhận được nó
module.exports = new SiteController();
