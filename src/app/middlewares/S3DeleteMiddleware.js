
module.exports = function destroyTodoImage(filename, callback) {
  const { WASABI_ENDPOINT, WASABI_ACCESS_KEY_ID, WASABI_SECRET_ACCESS_KEY, WASABI_BUCKET_NAME, WASABI_REGION }   = require("../../config/config")
  const AWS = require('aws-sdk');
  const endpoint = new AWS.Endpoint(WASABI_ENDPOINT)

  const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: WASABI_ACCESS_KEY_ID,
    secretAccessKey: WASABI_SECRET_ACCESS_KEY,
    region: WASABI_REGION
  });

  const imgKeys = filename.map(img => {
    return { Key: img.url }
  });

  var params = {
    Bucket: WASABI_BUCKET_NAME,
    Delete: {
      Objects: imgKeys,
      Quiet: false
    }
  };

  s3.deleteObjects(params, function (err, data) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      console.log(data)
      callback(null);
    }
  });
}