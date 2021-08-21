// Variables
const AWS                   = require('aws-sdk');
const sharp                 = require("sharp");
const { WASABI_ENDPOINT, WASABI_ACCESS_KEY_ID, WASABI_SECRET_ACCESS_KEY, WASABI_BUCKET_NAME, WASABI_REGION }   = require("../../config/config")
const endpoint = new AWS.Endpoint(WASABI_ENDPOINT)
// S3 config
const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: WASABI_ACCESS_KEY_ID,
    secretAccessKey: WASABI_SECRET_ACCESS_KEY,
    region: WASABI_REGION
});

var self = module.exports = {
    /**
     * 
     * Large image : width 1000px (webp)
     * Medium image: width 690px (jpeg)
     * Small image : width 400px (webp)
     */

    uploadMultiple: async (files, params) => {
        const images = [];

        const resizePromises = files.map(async (file) => {
            const filename = `${params.slug}/${params.chapter}/${Date.now()}-${file.originalname.replace(/\..+$/, "")}`;
             sharp(file.buffer)
                .resize({ width: 1000 , fit: 'contain'})
                .webp({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/webp',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-large.webp`,
                }).promise())
             sharp(file.buffer)
                .resize({ width: 690 , fit: 'contain'})
                .jpeg({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/jpeg',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-medium.jpeg`,
                }).promise())
             sharp(file.buffer)
                .resize({ width: 400 , fit: 'contain'})
                .webp({ quality: 80 })
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
                .jpeg({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: file.mimetype,
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-thumbnail-original.jpeg`,
                }).promise())
            sharp(file.buffer)
                .resize({ width: 160, fit: 'cover' })
                .webp({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/webp',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-thumbnail.webp`,
                }).promise())
            sharp(file.buffer)
                .resize({ height: 160, fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/jpeg',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-thumbnail.jpeg`,
                }).promise())

                images.url = filename
        });

        
        await Promise.all([...resizePromises])
        .then(console.log('done upload'));

        return images
    },

    uploadSliderImg: async (files, params) => {
        var images; 
        var resize = resizeSmall = new Object();
        if (params.type == 'slider') {

            resize = { height: 210, fit: 'cover' }
            resizeSmall = { height: 210, fit: 'cover' }

        } else if (params.type == 'banner') {

            resize = { width: 800, height: 400, fit: 'cover' }
            resizeSmall = { width: 650, fit: 'cover' }

        } else if (params.type == 'banner_background') {

            resize = { width: 1200, height: 500, fit: 'cover' }
            resizeSmall = { height: 500, fit: 'cover' }
        } else if (params.type == 'banner_topright' || params.type == 'banner_botright') {

            resize = { width: 300, height: 200, fit: 'cover' }
            resizeSmall = { height: 200, fit: 'cover' }
        }

        const resizePromises = files.map(async (file) => {
            const filename = `config/${params.type}/${Date.now()}-${file.originalname.replace(/\..+$/, "")}`;
            sharp(file.buffer)
                .resize(resize)
                .jpeg({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: file.mimetype,
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-thumbnail.jpeg`,
                }).promise())
            sharp(file.buffer)
                .resize(resize)
                .webp({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/webp',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-thumbnail.webp`,
                }).promise())
            sharp(file.buffer)
                .resize(resizeSmall)
                .webp({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: 'image/webp',
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}-thumbnail-small.webp`,
                }).promise())

                images = filename
        });

        
        await Promise.all([...resizePromises])
        .then(console.log('done upload'));

        return images
    },
}