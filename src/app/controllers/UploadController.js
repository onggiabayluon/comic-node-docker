// Variables
const Comic         = require('../models/Comic');
const Chapter       = require('../models/Chapter');
const Config       = require('../models/Config');
const path          = require('path');
const shortid       = require('shortid');
const ObjectID      = require('mongodb').ObjectID;
// Upload Middleware
const MulterUploadMiddleware = require("../middlewares/MulterUploadMiddleWare");
const S3UploadMiddleWare = require("../middlewares/S3UploadMiddleWare")
const S3DeleteMiddleware = require('../middlewares/S3DeleteMiddleware');
const imagesMiddle = require("../middlewares/ResizeMiddleware")

// const { Worker, isMainThread, parentPort }  = require('worker_threads');
const workerpool = require('workerpool');

class UploadController {

    // [POST] / stored /comics /:slug /S3-multiple-upload
    
    multipleUpload = async (req, res, next) => {
        MulterUploadMiddleware(req, res)
        .then(async () => { 
            const $chapter_id = new ObjectID()

            const workDir = path.join(__dirname, '..', 'middlewares', 'worker.js')

            const config = {
                customPath: `${req.params.slug}/chapter-${req.body.chapter}`
            }
            
            const pool = workerpool.pool(workDir);
            
            pool.exec('resize', [req.files, config])
                .then((result) => {

                    saveURLToDb(result, $chapter_id)

                    saveChapterRef(`chapter-${req.body.chapter}`, $chapter_id)

                })
                .catch((err) => {
                    console.error(err);
                })
                .then(() => {
                    console.log('pool terminated')
                    pool.terminate(); 
                });
                
        })
        .then(() => res.redirect('back'))
        .catch(err => next(err))
        
        function saveURLToDb(imagesURL, $chapter_id) {
            const newChapter = new Chapter({
                _id: $chapter_id,
                title: `${req.params.slug}`,
                chapter: `chapter-${req.body.chapter}`,
                chapterSlug: `${req.params.slug}-${shortid()}`,
                comicSlug: req.params.slug,
                coinRequired: req.body.coinRequired
            })
            imagesURL.forEach((url, index) => {
                newChapter.image[index] = { url: url }
            });
            newChapter.thumbnail = { url: imagesURL[0] }
            newChapter.save()
        };

        function saveChapterRef(chapterName, $chapter_id) {
            let date = new Date()
            let IOSDate = date.toISOString()
            Comic.updateOne(
                { slug: req.params.slug },
                {
                    $push: {
                        lastest_chapters: {
                            $each: [{ _id: $chapter_id, chapter: chapterName, updatedAt: IOSDate }],
                            $position: 0,
                            $slice: 3
                        },
                        chapters: { _id: $chapter_id, chapter: req.body.chapter, updatedAt: IOSDate }
                    },
                    "timestamps": true,
                }
            ).then(res => console.log(res))
        };
    };

    thumbnailUpload = async (req, res, next) => {
        MulterUploadMiddleware(req, res)
            .then(async () => {
                var params = {
                    slug: req.params.slug,
                }
                var imagesURL = await S3UploadMiddleWare.uploadThumbnail(req.files, params)
                deleteOldThumbnailOnS3()
                saveURLToDb(imagesURL)
            })
            .catch(err => next(err))

        function deleteOldThumbnailOnS3() {
            Comic
            .findOne({ slug: req.params.slug }).lean()
            .then(comic => {
                if (comic.thumbnail != null) {
                    let arrURL = [
                        {
                            url: comic.thumbnail.url + '-thumbnail.webp'
                        },
                        {
                            url: comic.thumbnail.url + '-thumbnail.jpeg'
                        },
                        {
                            url: comic.thumbnail.url + '-thumbnail-original.jpeg'
                        }
                    ]
                    S3DeleteMiddleware(arrURL, function (err) {
                        if (err) { return next(err) }
                      });
                }
            })
        };
        function saveURLToDb(imagesURL) {
            Comic.updateOne(
                { slug: req.params.slug },
                { thumbnail: imagesURL }
            )
            .then(res.redirect('back'))
        };
    };


    configUpload = async (req, res, next) => {
        req.check = 'nocheck'
        MulterUploadMiddleware(req, res)
        .then(async () => {
            var { category, type, title, subtitle, author, description, href, index } = req.body
            var params = { type: type }
            var imagesURL = await S3UploadMiddleWare.uploadSliderImg(req.files, params)
            deleteOldThumbnailOnS3()
            saveURLToDb(imagesURL)

            function deleteOldThumbnailOnS3() {
                
                Config
                .findOne({ category: category}).lean()
                .then(config => {
                    if (!config || !config[`${type}`]) return
                    
                    if (config[`${type}`][index] != undefined) {
                        let key = config[`${type}`][index]
                        let arrURL = [
                            {
                                url: key.url + '-thumbnail.webp'
                            },
                            {
                                url: key.url + '-thumbnail.jpeg'
                            },
                            {
                                url: key.url + '-thumbnail-small.webp'
                            }
                        ]
                        S3DeleteMiddleware(arrURL, function (err) {
                            if (err) { return next(err) }
                        });
                    }
                })
            };
            function saveURLToDb(imagesURL) {
                Config.findOne({ category: category })
                .lean()
                .then(info => {
                    var update
                    var cleanDescription = description.replace(/\s\s+/g, ' ')

                    // if array not have this item => then push new
                    if(!info[`${type}`] || !info[`${type}`][index]) {
                        update = { 
                            $setOnInsert: { category: category},
                            $push: {
                                [`${type}`]: {
                                    title: title,
                                    subtitle: subtitle,
                                    description: cleanDescription,
                                    author: author,
                                    href: href,
                                    url: imagesURL
                                }
                            }
                        }
                    } else {
                        // if array had this item => then set update
                        update = { 
                            $setOnInsert: { category: category},
                            $set: {
                                [`${type}.${index}`]: {
                                    title: title,
                                    subtitle: subtitle,
                                    description: cleanDescription,
                                    author: author,
                                    href: href,
                                    url: imagesURL
                                }
                            }
                        }
                    }
                    Config.updateOne(
                        { category: category}, update ,
                        { upsert: true, multi: true }
                    ).then(res.redirect('back'))
                })

            };
        })
        .catch(err => next(err))
    };
}

module.exports = new UploadController();
