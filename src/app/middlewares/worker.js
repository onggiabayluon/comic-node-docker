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

const resize = async (file, extension, imageType, width, path, now) => {
    try {

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
        
    } catch (error) {
		console.error(error)
    }
};


// const { parentPort, isMainThread  } = require('worker_threads');

const workerpool = require('workerpool');

const main = async (files, config) => {

    const promiseData = []

    const rightnow = Date.now()

    // console.log("Worker recieved Data...");

    for (const file of files) {

        // Create path
        let path = `${config.customPath}/${rightnow}-${file.originalname.replace(/\..+$/, "")}`;

        // Resize Each time 3 type 
        await Promise.all([
            resize(file, 'large.webp', 'webp', 1000, path, rightnow),
            resize(file, 'medium.jpeg', 'jpeg', 690, path, rightnow),
            resize(file, 'small.webp', 'webp', 400, path, rightnow),
        ])

        // Prepare Path to db
        promiseData.push(path)
    }
    
    return promiseData
}

// main() ❌

workerpool.worker({
    resize: main
});
