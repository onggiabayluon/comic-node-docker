// Variables
const sharp = require("sharp");
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("../../config/config")
// S3 config
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
});

const s3Promises = [];

const uploadLoadToS3 = (options, resized) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (err, url) => {
            if (err) return reject(err);
            return resolve(url.secure_url);
        }).end(resized)
    });
}


const resize = async (file, imgSize, imageType, width, path, now, getMeta) => {
    try {
        const pathAndFileName = `${path}-${imgSize}`;
        
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
                const options = {
                    public_id: pathAndFileName,
                    use_filename: true,
                    unique_filename: false
                };

                // Push metadata ( width and height )
                if (getMeta) {
                    $result.originalWidth = resized.info.width
                    $result.originalHeight = resized.info.height
                }

                // promise s3 upload
                s3Promises.push(uploadLoadToS3(options, resized.data))
                
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
            resize(file, 'large', 'image/jpeg', 1000, path, rightnow, true),
            // resize(file, 'medium.jpeg', 'image/jpeg', 690, path, rightnow, false),
            resize(file, 'small', 'image/webp', 400, path, rightnow, false),
        ])
        
        // Resolve upload to Cloudinary
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
