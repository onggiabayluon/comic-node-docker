const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, IMAGE_URL } = require("../../config/config")
// S3 config
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

var self = module.exports = {
  destroyFolder: (folderName, callback) => {
    cloudinary.api.delete_resources_by_prefix(folderName, function (error, result) {
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

  destroyImages: (filename, callback) => {
    let imgKeys = filename.map(img => {
      return img.url
    });

    imgKeys.forEach(public_id => {
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
