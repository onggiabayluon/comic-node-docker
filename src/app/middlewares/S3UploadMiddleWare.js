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

    uploadMultiple: async (files, config) => {
        const images = [];

        const resize = async (file, extension, imageType, width, path, now) => {
            const filename = `${path}-${extension}`;

            await sharp(file.buffer)
                .resize({ width: width })
                .webp({ quality: 80 })
                .toBuffer()
                .then(resized => s3.upload({
                    Body: resized,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: imageType,
                    CacheControl: 'max-age=31536000',
                    Key: `${filename}`,
                }).promise())
                .then(() => {
                    console.log('Runtime in MS: ', Date.now() - now, 'ms');
                })

            return filename
        };


        const rightnow = Date.now()
    
        for (const file of files) {
    
            // Create path
            let path = `${config.customPath}/${rightnow}-${file.originalname.replace(/\..+$/, "")}`;
    
            // Resize Each time 3 type 
            await Promise.all([
                resize(file, 'large.webp', 'webp', 1000, path, rightnow),
                resize(file, 'medium.jpeg', 'jpeg', 690, path, rightnow),
                resize(file, 'small.webp', 'webp', 400, path, rightnow),
            ])
        }
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