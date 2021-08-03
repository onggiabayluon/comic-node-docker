// Variables
const AWS                   = require('aws-sdk');
const sharp                 = require("sharp");
const { WASABI_ENDPOINT, WASABI_ACCESS_KEY_ID, WASABI_SECRET_ACCESS_KEY, WASABI_BUCKET_NAME }   = require("../../config/config")

// S3 config
const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint("s3.eu-central-1.wasabisys.com"),
    accessKeyId: WASABI_ACCESS_KEY_ID,
    secretAccessKey: WASABI_SECRET_ACCESS_KEY,
});

var self = module.exports = {
    uploadMultiple: async (files, params) => {
        const images = [];

        const resizePromises = files.map(async (file) => {
            const filename = `${params.slug}/${params.chapter}/${Date.now()}-${file.originalname.replace(/\..+$/, "")}`;
            // console.log(filename)
             sharp(file.buffer)
                .resize({ width: 1000 , fit: 'contain'})
                .jpeg({ quality: 90 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: file.mimetype,
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-large.jpeg`,
                }).promise())
             sharp(file.buffer)
                .resize({ width: 690 , fit: 'contain'})
                .webp({ quality: 90 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/webp',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-medium.webp`,
                }).promise())
             sharp(file.buffer)
                .resize({ width: 400 , fit: 'contain'})
                .webp({ quality: 90 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/webp',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-small.webp`,
                }).promise())

                images.push({url: filename});
               
        });

        
        await Promise.all([...resizePromises])
        .then(console.log('done upload'));

        return images
    },
    
    uploadThumbnail: async (files, params) => {
        const images = new Object();

        const resizePromises = files.map(async (file) => {
            const filename = `${params.slug}/thumbnail/${Date.now()}-${file.originalname.replace(/\..+$/, "")}`;
            sharp(file.buffer)
                .resize({ width: 320, fit: 'cover' })
                .jpeg({ quality: 90 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: file.mimetype,
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-thumbnail-original.jpeg`,
                }).promise())
            sharp(file.buffer)
                .resize({ width: 175, height: 238, fit: 'cover' })
                .webp({ quality: 90 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/webp',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-thumbnail.webp`,
                }).promise())

                images.url = filename
        });

        
        await Promise.all([...resizePromises])
        .then(console.log('done upload'));

        return images
    },
}