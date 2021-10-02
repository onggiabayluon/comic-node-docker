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

const s3Promises = [];

const uploadLoadToS3 = (params) => {
    return s3.upload(params).promise();
}

const resize = async (file, extension, imageType, width, path, now, getMeta) => {
    try {
        const filename = `${path}-${extension}`;
        const sharpResize = sharp(file.buffer).resize({ width: width })
        const $result = {
            originalWidth: 0,
            originalHeight: 0,
        }

        if (imageType === 'image/webp') sharpResize.webp({ quality: 80 })
        else sharpResize.jpeg({ quality: 80 })

        await sharpResize
            .toBuffer({ resolveWithObject: true })
            .then(resized => {

                // s3 params
                const params = {
                    Body: resized.data,
                    Bucket: WASABI_BUCKET_NAME,
                    ContentType: imageType,
                    CacheControl: 'max-age=31536000',
                    Key: filename,
                } 

                // Push metadata ( width and height )
                if (getMeta) {
                    $result.originalWidth = resized.info.width
                    $result.originalHeight = resized.info.height
                }

                // promise s3 upload
                s3Promises.push(uploadLoadToS3(params))
                
            })

        if (getMeta) return $result
        
    } catch (error) {
		console.error(error)
    }
};


// const { parentPort, isMainThread  } = require('worker_threads');

const workerpool = require('workerpool');

const main = async (files, config) => {

    const resizedMetas = []

    const rightnow = Date.now()

    // console.log("Worker recieved Data...");

    for (const file of files) {
        // Create path
        let path = `${config.customPath}/${rightnow}-${file.originalname.replace(/\..+$/, "").replace(/\s/g, '')}`;

        // Resize Each time 3 type 
        const meta = await Promise.all([
            resize(file, 'large.webp', 'image/webp', 1000, path, rightnow, true),
            resize(file, 'medium.jpeg', 'image/jpeg', 690, path, rightnow, false),
            resize(file, 'small.webp', 'image/webp', 400, path, rightnow, false),
        ])
        
        // upload to s3
        await Promise.all(s3Promises)

        // Prepare Path to db
        resizedMetas.push({
            "url": path, 
            "width": meta[0].originalWidth,
            "height": meta[0].originalHeight,
        })

    }
    
    return resizedMetas
}

// main() ❌

workerpool.worker({
    resize: main
});
