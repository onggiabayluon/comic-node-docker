const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, IMAGE_URL } = require("../../config/config")
// S3 config
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

/*
  ["survival-story-of-a-sword-king-in-a-fantasy-world/chapter-1/-thumbnail-webp",
  survival-story-of-a-sword-king-in-a-fantasy-world/chapter-1/-thumbnail-jpeg",
  survival-story-of-a-sword-king-in-a-fantasy-world/chapter-1/-thumbnail-small"
  ]
*/

function getCustomFormatURLs(url, formatSizes) {
  const FORMAT_SIZES = formatSizes 
  
  const URLS = []
  
  FORMAT_SIZES.forEach(formatSize => URLS.push(url + formatSize))
  
  return URLS
}

function getFolderURL(url) {
  let public_id = url

  let splited_public_id = public_id.split('/')

  splited_public_id.pop(splited_public_id.indexOf('2'))

  let folderUrl = splited_public_id.join('/')

  return folderUrl
}


var self = module.exports = {
  destroyFolder: (url, callback) => {
    let folderURL = getFolderURL(url)

    cloudinary.api.delete_resources_by_prefix(folderURL, function (error, result) {
      if (error) {
        console.log("Error in cloudinary.uploader.upload_stream\n", error);
        callback(error);
      } else {
        console.log('Cloudinary destroy result:');
        console.log(result);
        callback(null);
      }
    })
  },

  destroyImages: (url, formatSizes, callback) => {
    let urls = getCustomFormatURLs(url, formatSizes)

    urls.forEach(public_id => {
      cloudinary.uploader.destroy(public_id, function (error, result) {
        if (error) {
          console.log("Error in cloudinary.uploader.upload_stream\n", error);
          callback(error);
        } else {
          console.log('Cloudinary destroy result:');
          console.log(result);
          callback(null);
        }
      })
    })
    
  },


}
