// Variables
const Comic         = require('../models/Comic');
const Chapter       = require('../models/Chapter');
const Config       = require('../models/Config');

const shortid       = require('shortid');
const ObjectID      = require('mongodb').ObjectID;
// Upload Middleware
const MulterUploadMiddleware = require("../middlewares/MulterUploadMiddleWare");
const S3UploadMiddleWare = require("../middlewares/S3UploadMiddleWare")
const S3DeleteMiddleware = require('../middlewares/S3DeleteMiddleware');
class UploadController {

    // [POST] / stored /comics /:slug /S3-multiple-upload
    
    multipleUpload = async (req, res, next) => {
        MulterUploadMiddleware(req, res)
        .then(async () => { 

            var params = {
                slug: req.params.slug,
                chapter: `chapter-${req.body.chapter}`
            }

            var imagesURL = await S3UploadMiddleWare.uploadMultiple(req.files, params)

            var res_id = await saveURLToDb(imagesURL)

            saveChapterRef(res_id)

        })
        .then(() => res.redirect('back'))
        .catch(err => next(err))
        
        function saveURLToDb(imagesURL) {
            // console.log(imagesURL)
            const newChapter = new Chapter({
                _id: new ObjectID(),
                title: `chapter of ${req.params.slug}`,
                chapter: `chapter-${req.body.chapter}`,
                chapterSlug: `${req.params.slug}-${shortid()}`,
                comicSlug: req.params.slug,
            })
            imagesURL.forEach((url, index) => {
                newChapter.image[index] = url
            });
            newChapter.save()
            
            return newChapter._id
        };
        function saveChapterRef(res_id) {
            Comic.updateOne(
                { slug: req.params.slug },
                { $push: { chapters: res_id } }
            ).exec()
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

                // let update = { 
                //     $setOnInsert: { category: category},
                //     $push: {
                //         [`${type}.${index}`]: {
                //             title: title,
                //             subtitle: subtitle,
                //             description: cleanDescription,
                //             author: author,
                //             href: href,
                //             url: imagesURL
                //         }
                //     }
                // }
               
            };
        })
        .catch(err => next(err))
    };
}

module.exports = new UploadController();
