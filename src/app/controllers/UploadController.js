// Variables
const Comic         = require('../models/Comic');
const Chapter       = require('../models/Chapter');
const Config       = require('../models/Config');
const path          = require('path');
const shortid       = require('shortid');
const ObjectID      = require('mongodb').ObjectID;
// Upload Middleware
const MulterUploadMiddleware = require("../middlewares/MulterUploadMiddleWare");
const S3UploadMiddleWare = require("../middlewares/S3UploadMiddleWare");
// const S3DeleteMiddleware = require('../middlewares/S3DeleteMiddleware');
const cloudinaryDeleteMiddleware = require('../middlewares/CloudinaryDeleteMiddleware');
const cloudinaryUploadMiddileWare = require("../middlewares/CloudinaryUploadMiddleWare");

// const { Worker, isMainThread, parentPort }  = require('worker_threads');
const workerpool = require('workerpool');
const { THUMBNAIL_FORMAT_SIZES } = require('../../config/config');

class UploadController {

    // [POST] / stored /comics /:slug /S3-multiple-upload
    
    multipleUpload = async (req, res, next) => {
        MulterUploadMiddleware(req, res)
        .then(async () => { 
            const $comicThumbnail = req.body.comicThumbnail
            const $comicTitle = req.body.comicTitle
            const $chapter_id = new ObjectID()

            const workDir = path.join(__dirname, '..', 'middlewares', 'workerCloudinary.js')

            const config = {
                customPath: `${req.params.slug}/chapter-${req.body.chapter}`
            }
            
            const pool = workerpool.pool(workDir);
            
            pool.exec('resize', [req.files, config])
                .then((result) => {

                    saveURLToDb(result, $chapter_id, $comicThumbnail, $comicTitle)

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
        
        function saveURLToDb(metadatas, $chapter_id, $comicThumbnail, $comicTitle) {
            const newChapter = new Chapter({
                _id: $chapter_id,
                title: $comicTitle,
                chapter: `chapter-${req.body.chapter}`,
                chapterSlug: `${req.params.slug}-${shortid()}`,
                comicSlug: req.params.slug,
                coin: {
                    required: req.body.coinRequired,
                    expiredAt: req.body.date
                },
                image: [],
            })

            metadatas.forEach((metadata, index) => {
                newChapter.image.push(metadata)
            });
            newChapter.thumbnail = { url: $comicThumbnail }
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
                        // chapters: { _id: $chapter_id, chapter: req.body.chapter, updatedAt: IOSDate }
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
                var imagesURL = await cloudinaryUploadMiddileWare.uploadThumbnail(req.files, params)
                deleteOldThumbnailOnS3()
                saveURLToDb(imagesURL)
            })
            .catch(err => next(err))

        function deleteOldThumbnailOnS3() {
            Comic
            .findOne({ slug: req.params.slug }).lean()
            .then(comic => {
                if (comic.thumbnail != null) {
                    const formatSizes = THUMBNAIL_FORMAT_SIZES

                    const url = comic.thumbnail.url

                    const callback = (err) => {
                        if (err) return next(err)
                    }

                    cloudinaryDeleteMiddleware.destroyImages(url, formatSizes, callback) 
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

            var imagesURL = await cloudinaryUploadMiddileWare.uploadSliderImg(req.files, params)
            
            deleteOldThumbnailOnS3()
            saveURLToDb(imagesURL)

            function deleteOldThumbnailOnS3() {
                Config
                .findOne({ category: category}).lean()
                .then(config => {
                    if (!config || !config[`${type}`]) return
                    
                    if (config[`${type}`][index] != undefined) {
                        let key = config[`${type}`][index]

                        const formatSizes = THUMBNAIL_FORMAT_SIZES

                        const url = key.url

                        const callback = (err) => {
                            if (err) return next(err)
                        }

                        cloudinaryDeleteMiddleware.destroyImages(url, formatSizes, callback) 
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
