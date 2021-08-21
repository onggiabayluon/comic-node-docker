// Variables
const AWS = require('aws-sdk');
const sharp = require("sharp");
const { WASABI_ENDPOINT, WASABI_ACCESS_KEY_ID, WASABI_SECRET_ACCESS_KEY, WASABI_BUCKET_NAME, WASABI_REGION } = require("../../config/config")
const endpoint = new AWS.Endpoint(WASABI_ENDPOINT)
const { parentPort } = require('worker_threads');
// S3 config
const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: WASABI_ACCESS_KEY_ID,
    secretAccessKey: WASABI_SECRET_ACCESS_KEY,
    region: WASABI_REGION
});


const resize = async (files, config, resizeOptions, now) => {
    try {
        
        // Array of Path for save
        var imagesPaths = [];

        // Promise 
        const resizePromises = files.map(async (file) => {

            resizeOptions.map(async (resizeOption) => {

                const { width, suffix, type } = resizeOption
                
                const filename = `${config.customPath}/${Date.now()}-${file.originalname.replace(/\..+$/, "")}`;
                
                imagesPaths.push({ url: filename });

                await sharp(file.buffer)
                    .resize({ width: width })
                    .webp({ quality: 80 })
                    .toBuffer()
                    .then(resized => s3.upload({
                        Body: resized,
                        Bucket: WASABI_BUCKET_NAME,
                        ContentType: type,
                        CacheControl: 'max-age=31536000',
                        Key: `${filename}-${suffix}`,
                    }).promise())
                    .then(() => {
                        console.log('Runtime in MS: ', Date.now() - now, 'ms');
                    })
            });

        });
        console.log(resizePromises)
        // Resolve Promises
        // await Promise.all(resizePromises)
        // return imagesPaths
        
    } catch (error) {
		console.error(error)
    }
};



module.exports = { resize };
