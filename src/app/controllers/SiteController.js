//Mô hình mvc: từ clients --> 1. request lên controller --> 2. chọc vào model
// --> 3. lấy được dữ liệu mang về controller --> 4. chọc sang views, lấy data
// từ model truyền sang views --> 5. views render trả về client
const Comic     = require('../models/Comic');
const Config    = require('../models/Config');
const User      = require('../models/User');
const TopView      = require('../models/TopView');
const { singleMongooseToObject } =  require('../../util/mongoose');
const { IMAGE_URL, HOME_TITLE, HOME_DESCRIPTION
, HOME_KEYWORDS, HOME_URL, HOME_SITENAME } = require('../../config/config');

// connect to redis
// const path  = require('path');
// const redis = require(path.resolve('./src/config/redis'))
// redis.connect();

class SiteController {

    async test(req, res, next) {
        // const mongoose = require('mongoose')
        // mongoose.set('debug', true);


        // Fetch top10 Data With Sort
        // let Top10View = await TopView.find({}).lean().sort({views: -1}).limit(10)
        // .hint( { views: 1 } ).explain("executionStats")
        // return res.json(Top10View)

        // Genrerate Data
        const shortid = require('shortid');
 
        function randomIntFromInterval(min, max) { // min and max included 
            return Math.floor(Math.random() * (max - min + 1) + min)
        }

        let keys = []
        let makeData = 10
        // for (let i = 0; i < makeData; i++) {
        //     keys.push({
        //         key: shortid.generate(), 
        //         count: randomIntFromInterval(1,200)
        //     })
        // }
        keys = [{
            slug: 'adaddada',
            count: 10,
        }]
        // TopView.insertMany([keys]).then(data => res.json(data))
        // Update && Upsert Data
        let today = new Date();
        let dd = today.getDate();
        let bulkArr = []
        for (const i of keys) {
            bulkArr.push({
                updateOne: {
                    "filter": { "slug": i.key },
                    "update": [{ 
                        $addFields: {
                            "view.dayView.thisDay": dd,
                            "view.totalView": {
                                $cond: {
                                    if: { $gt: [ "$view.totalView", null ] },
                                    then: { $add: [ i.count, "$view.dayView.view" ] },
                                    else: { $add: [ i.count, 0 ] }
                                }
                            },
                            "view.dayView.view": {
                                $cond: {
                                    if: { $eq: [ "$view.dayView.thisDay", dd ] },
                                    then: { $add: [ "$view.dayView.view", i.count ] },
                                    else: 0
                                }
                            },
                        }
                    }], 
                    "upsert": true,
                    "timestamps": false,
                }
            })
        }
        console.log(bulkArr)
        var bulkwriteResult = await TopView.bulkWrite(bulkArr)
        res.json(bulkwriteResult)


        // TopView.collection.getIndexes({full: true}).then(indexes => {
        //     console.log("indexes:", indexes);
        //     // ...
        // }).catch(console.error);

       
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
            Comic.find({})
            .select('-description -chapters')
            .skip(skipCourse)
            .limit(PageSize)
            .lean(),
            Config.findOne({ category: "image" }).lean(),
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
          .then(([count, comicsDoc, config, subscribeList]) => {
            let meta = {
                home_title: HOME_TITLE,
                home_description: HOME_DESCRIPTION,
                home_keywords: HOME_KEYWORDS,
                home_url: HOME_URL,
                home_sitename: HOME_SITENAME
            }
            res.status(200).render('home', { 
                layout: 'home_layout',
                comics: comicsDoc,
                current: page,
                nextPage,
                prevPage,
                prevPage2,
                pages: Math.ceil(count / PageSize),
                user: singleMongooseToObject(req.user),
                img_url: IMAGE_URL,
                config: config,
                // commentDoc: commentDoc,
                sublist: subscribeList,
                meta
             });
          })
          .catch(err => next(err))
    }
    
}

//export (SiteController) thì lát require nhận được nó
module.exports = new SiteController();
