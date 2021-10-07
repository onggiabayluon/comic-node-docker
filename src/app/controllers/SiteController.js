//Mô hình mvc: từ clients --> 1. request lên controller --> 2. chọc vào model
// --> 3. lấy được dữ liệu mang về controller --> 4. chọc sang views, lấy data
// từ model truyền sang views --> 5. views render trả về client
const Comic     = require('../models/Comic');
const Config    = require('../models/Config');
const Chapter    = require('../models/Chapter');
const Pocket = require('../models/Pocket');
const moment = require('moment-timezone')
const calcEng = require('../../config/middleware/CalcTimeEnglish')
const ObjectID  = require('mongodb').ObjectID;
const { TEST, IMAGE_URL, HOME_TITLE, HOME_DESCRIPTION
, HOME_KEYWORDS, HOME_URL, HOME_SITENAME, IMAGE_URL_HTTP } = require('../../config/config');


class SiteController {

    async test2(req, res, next) {
        return res.json(TEST)

        // Chapter.findOne(
        //     {_id: "614a909167dfed28d0116200"}
        // ).then(result => {
        //     // const d1 = new Date(result.coin.expiredAt)
        //     // const diff = Math.abs(d1 - Date.now())
        //     // res.json( diff )
        //     const date2 =  moment( result.coin.expiredAt );
        //     return res.json(date2.isBefore())
        // })
        // res.json(new Date("28-09-2021 09:47").toISOString())
        const obj = {
            user_id: "6084dd9dec23a633c03f96e7",
            pockets: [
                {
                    "comicSlug" : "kill-the-hero",
                    "chapters"  : ["12133113", "416123131"],
                },
                {
                    "comicSlug" : "magic-emperor",
                    "chapters"  : ["23131132", "7777777777"],
                },
            ]
        }
        
        const $find = { "user_id": "6084dd9dec23a633c03f96e7", "pockets.comicSlug" : "kill-the-hero"}
     
        const $match = { "pockets": { $elemMatch : { "chapters": "61512d493384b80fe0c48ec3"  } } }
        

        // Find
        Pocket.findOne($find, $match)
        .lean()
        .then(resp => {
            res.json(resp)
            // res.json(resp.pockets.length)
        })

        
        
        const comicSlug = 'end-world'
        const newPockets = {
            comicSlug: comicSlug,
            chapters: ["7777777777"]
        }
        const $find2 = { "user_id": "6088c977f3e3952ab0cbe7f5", "pockets.comicSlug" : comicSlug }
        // Push new Id
        // const isExist = await Pocket.findOne($find2).countDocuments()
        // if (isExist) return update()
        // else return insert()

        // function insert() {
        //     Pocket.updateOne(
        //         {
        //             "user_id": "6088c977f3e3952ab0cbe7f5", 
        //         },
        //         {
        //             $push: { "pockets": newPockets },
        //         },
        //         {
        //             upsert: true
        //         }
        //     ).then(resp => res.json(resp))
        // };
        // function update() {
        //     Pocket.updateOne(
        //         { 
        //             "user_id": "6088c977f3e3952ab0cbe7f5", 
        //             "pockets.comicSlug" : comicSlug 
        //         }, 
        //         { 
        //             $addToSet: { "pockets.$.chapters": ["88888888888"] },
        //         },
        //     ).then(resp => res.json(resp))
        // }
        

        // Insert New
        // Pocket.insertMany([obj]).then(resp => res.json(resp))

        // updateMany(
        //     { },
        //     { $set: { "view.monthView.view": 0,"view.monthView.thisMonth": 9,"view.yearView.view": 0,"view.yearView.thisYear": 2021 }},
        //     { }
        // )
        // Chapter.updateMany(
        //     { comicSlug: 'kill-the-hero' },
        //     { $set: { comicSlug: 'kill-the-hero-2'}})
        //     .then(result => console.log({result: result}))
        //     .catch(next)
        // const Comment      = require('../models/Comment');
        // const   $find = { comicSlug: "kill-the-hero", chapter: null },
        //         $match = { commentArr : { $elemMatch : { "reply._id" : '61375c28d291b036c8068b03' } } }
        // Comment.findOne($find,$match)
        // .then(result => testfunc(result))
        // // res.json(req.user)
        // // Comic.updateMany({}, {$unset: {lastest_chapters: 1 }}).then(res => console.log(res))
        // function testfunc(result) {
        //     return res.json(result)
        // }
    }
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
        let dd = new Date().getDate();
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
        var bulkwriteResult = await TopView.bulkWrite(bulkArr)
        res.json(bulkwriteResult)


        // TopView.collection.getIndexes({full: true}).then(indexes => {
        //     console.log("indexes:", indexes);
        //     // ...
        // }).catch(console.error);

       
    }

    // [GET] / Site
    index(req, res, next) {
        let id = (req.user) ? req.user._id : null
        let page = +req.query.page || 1;
        let PageSize = 10;
        let skipCourse = (page - 1) * PageSize;
        let nextPage = +req.query.page + 1 || 2;
        let prevPage = +req.query.page - 1;
        let prevPage2 = +req.query.page - 2;
        let limitTopView = 10;

        Promise.all([
            Comic.countDocuments({})
            , Comic.find({})
            .select('-description -chapters')
            .sort({ updatedAt: -1 })
            .skip(skipCourse)
            .limit(PageSize)
            .lean()
            , Config.findOne({ category: "image" }).lean()
            , Comic.find({})
            .select('view rate title author slug thumbnail')
            .sort({ "view.dayView.view": -1 })
            .limit(limitTopView)
            .lean(),
          ])
          .then(([count, comicsDoc, config, topComicsByView]) => {
            let meta = {
                home_title: HOME_TITLE,
                home_description: HOME_DESCRIPTION,
                home_keywords: HOME_KEYWORDS,
                home_url: HOME_URL,
                home_sitename: HOME_SITENAME,
                image_url_http: IMAGE_URL_HTTP
            }
            res.status(200).render('home', { 
                layout: 'home_layout',
                comics: comicsDoc,
                current: page,
                nextPage,
                prevPage,
                prevPage2,
                pages: Math.ceil(count / PageSize),
                user: req.user,
                img_url: IMAGE_URL,
                config: config,
                topComicsByView: topComicsByView,
                meta
             });
          })
          .catch(err => next(err))
    }
    
}

//export (SiteController) thì lát require nhận được nó
module.exports = new SiteController();
