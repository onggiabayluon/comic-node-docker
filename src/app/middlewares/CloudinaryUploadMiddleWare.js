// Variables
const sharp                 = require("sharp");
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("../../config/config")
// S3 config
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
});

const uploadLoadToS3 = (options, resized) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (err, url) => {
            if (err) return reject(err);
            return resolve(url.secure_url);
        }).end(resized)
    });
}


var self = module.exports = {
    /**
     * 
     * Large image : width 1000px (webp)
     * Medium image: width 690px (jpeg)
     * Small image : width 400px (webp)
     */

    
    uploadThumbnail: async (files, params) => {
        const images = new Object();

        const resizePromises = files.map(async (file) => {

            const filename = `${params.slug}/thumbnail/${Date.now()}-${file.originalname.replace(/\..+$/, "")}`;
           
            const options = {
                use_filename: true,
                unique_filename: false
            };

            sharp(file.buffer)
                .resize({ width: 320, fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer()
                .then(resized => {
                    options.public_id = filename + '-thumbnail-original'
                    options.format = 'jpeg'
                    resized_cloudinary_url = uploadLoadToS3(options, resized)
                })
            sharp(file.buffer)
                .resize({ width: 160, fit: 'cover' })
                .webp({ quality: 80 })
                .toBuffer()
                .then(resized => {
                    options.public_id = filename + '-thumbnail-webp'
                    options.format = 'webp'
                    uploadLoadToS3(options, resized)
                })
            sharp(file.buffer)
                .resize({ height: 160, fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer()
                .then(resized => {
                    options.public_id = filename + '-thumbnail-jpeg'
                    options.format = 'jpeg'
                    uploadLoadToS3(options, resized)
                })

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