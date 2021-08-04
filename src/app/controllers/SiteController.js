//Mô hình mvc: từ clients --> 1. request lên controller --> 2. chọc vào model
// --> 3. lấy được dữ liệu mang về controller --> 4. chọc sang views, lấy data
// từ model truyền sang views --> 5. views render trả về client
const Comic     = require('../models/Comic');

const { singleMongooseToObject } =  require('../../util/mongoose');
const User = require('../models/User');

// connect to redis
// const path  = require('path');
// const redis = require(path.resolve('./src/config/redis'))
// redis.connect();

class SiteController {

    test(req, res, next) {
        res.send("<h1> Hello </h1>")
    }

    // [GET] / Site
    index(req, res, next) {
        // Comic.updateMany({}, {rate: {rateCount: 0, rateValue: 0}}).then(info => console.log(info))

        let id = (req.user) ? req.user._id : null
        let page = +req.query.page || 1;
        let PageSize = 10;
        let skipCourse = (page - 1) * PageSize;
        let nextPage = +req.query.page + 1 || 2;
        let prevPage = +req.query.page - 1;
        let prevPage2 = +req.query.page - 2;

        Promise.all([
            Comic.countDocuments({}),
            Comic.find({ chaptername: { $not: { $exists: true } } }).lean()
            .skip(skipCourse)
            .limit(PageSize)
            .sort({ updatedAt: -1})
            .populate({
                path: 'chapters',
                select: 'chapter updatedAt',
                options: {
                    limit: 3,
                    sort: { updatedAt: -1},
                }
            }),
            // Comment.aggregate([
            //     {
            //         $match:  { }
            //     },
            //     {
            //         $sort: {'updatedAt': -1}
            //     },
            //     {
            //         //limit n document = n comments needed
            //         $limit: 5
            //     },
            //     {
            //         $unwind: "$commentArr"
            //     },
            //     {
            //         $sort: {'commentArr.updatedAt': -1}
            //     },
            //     {
            //         // comments needed
            //         $limit: 5
            //     },
            //     {
            //         $group: {
            //         _id: '$_id', 
            //         chapter:    { $first: '$chapter'    }, 
            //         comicSlug:  { $first: '$comicSlug'  }, 
            //         title:      { $first: '$title'      }, 
            //         commentArr: { $push: '$commentArr'  }}
            
            //     },
            //     {
            //         $project: { commentArr: 1, chapter: 1, title: 1, comicSlug: 1,  _id: 0 }
            
            //     }
            // ]), 
            User.findOne({ _id: id }).lean()
            .select('subscribed')
            .populate({
                path: 'subscribed',
                populate: {
                    path: "chapters",
                    select: "chapter updatedAt _id",
                    options: {
                        limit: 2,
                        sort: { updatedAt: -1},
                    }
                },
                select: 'title thumbnail slug updatedAt chapters',
                options: {
                    limit: 5,
                    sort: { updatedAt: -1},
                }
            })
          ])
          .then(([count, comicsDoc, subscribeList]) => {
            res.status(200).render('home', { 
                layout: 'home_layout',
                comics: comicsDoc,
                current: page,
                nextPage,
                prevPage,
                prevPage2,
                pages: Math.ceil(count / PageSize),
                user: singleMongooseToObject(req.user),
                // commentDoc: commentDoc,
                sublist: subscribeList
             });
          })
          .catch(err => next(err))
    }
    
}

//export (SiteController) thì lát require nhận được nó
module.exports = new SiteController();
