// Variables
const AWS = require('aws-sdk');
const sharp = require("sharp");
const { WASABI_ENDPOINT, WASABI_ACCESS_KEY_ID, WASABI_SECRET_ACCESS_KEY, WASABI_BUCKET_NAME, WASABI_REGION } = require("../../config/config")
const endpoint = new AWS.Endpoint(WASABI_ENDPOINT)
// S3 config
const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: WASABI_ACCESS_KEY_ID,
    secretAccessKey: WASABI_SECRET_ACCESS_KEY,
    region: WASABI_REGION
});

var count = 0;
const resize = async (file, extension, imageType, width, path, now) => {
    try {
        // Array of Path for save
        var imagesPaths = [];

        const filename = `${path}/${Date.now()}-${count}-${extension}`;
        
        count++

        // imagesPaths.push({ url: filename });

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
        
    } catch (error) {
		console.error(error)
    }
};


// const { parentPort, isMainThread  } = require('worker_threads');

const workerpool = require('workerpool');

const main = async (files, config) => {
    const promiseData = []
    console.log("Worker recieved Data...");
    for (const file of files) {
        // Resize Each time 3 type 
        await Promise.all([
            resize(file, 'large.webp', 'webp', 1000, config.customPath, Date.now()),
            resize(file, 'medium.jpeg', 'jpeg', 690, config.customPath, Date.now()),
            resize(file, 'small.webp', 'webp', 400, config.customPath, Date.now()),
        ])
        .then(data => {
            promiseData.push(data)
        })
    }
    console.log(promiseData)
    return promiseData
}

// main() ❌

workerpool.worker({
    main: main
});
