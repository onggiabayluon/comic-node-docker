module.exports = {
    MONGO_IP: process.env.MONGO_IP || "mongo",
    MONGO_PORT: process.env.MONGO_PORT || 27017,
    MONGO_USER: process.env.MONGO_USER,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_FOLDER: process.env.MONGO_FOLDER || "mydb",
    REDIS_URL: process.env.REDIS_URL || "redis",
    REDIS_PORT: process.env.REDIS_PORT || 6379,

    WASABI_ACCESS_KEY_ID: process.env.WASABI_ACCESS_KEY_ID,
    WASABI_SECRET_ACCESS_KEY: process.env.WASABI_SECRET_ACCESS_KEY,
    WASABI_ENDPOINT: process.env.WASABI_ENDPOINT || 's3.ap-northeast-1.wasabisys.com',
    WASABI_BUCKET_NAME: process.env.WASABI_BUCKET_NAME || "storagepongpong",
    WASABI_REGION: process.env.WASABI_REGION || "ap-northeast-1",
    IMAGE_URL: process.env.URL || "https://s3.ap-northeast-1.wasabisys.com/storagepongpong",

    //DEV
    MONGO_IP: process.env.MONGO_IP || "mongo",
    MONGO_PORT: process.env.MONGO_PORT || 27017,
    MONGO_USER: process.env.MONGO_USER || 'ducchuy',
    MONGO_PASSWORD: process.env.MONGO_PASSWORD || 'mypassword',
    MONGO_FOLDER: process.env.MONGO_FOLDER || "mydb",
    REDIS_URL: process.env.REDIS_URL || "127.0.0.1",
    REDIS_PORT: process.env.REDIS_PORT || 6379,

    WASABI_ACCESS_KEY_ID: process.env.WASABI_ACCESS_KEY_ID || 'BCEWE56X3DXR2LMFRV5L',
    WASABI_SECRET_ACCESS_KEY: process.env.WASABI_SECRET_ACCESS_KEY || 'eIYYeXuFt5Dk06e3VPFMUDEcU4vjgbsk2jsv2SD9',
    WASABI_ENDPOINT: process.env.WASABI_ENDPOINT || 's3.ap-northeast-1.wasabisys.com',
    WASABI_BUCKET_NAME: process.env.WASABI_BUCKET_NAME || "storagepongpong",
    WASABI_REGION: process.env.WASABI_REGION || "ap-northeast-1",
    IMAGE_URL: process.env.URL || "https://s3.ap-northeast-1.wasabisys.com/storagepongpong",

    UPDATE_PER_MIN: 10,

    TEST: process.env.TEST || "test",
    HOME_TITLE: "Read Manga Online - Dorecomic",
    HOME_DESCRIPTION: "Read manga online free at Dorecomic with fastest update",
    DETAIL_PAGE_DESCRIPTION: "with high quality images, update fastest at",
    HOME_KEYWORDS: "read manga online, dorecomic, dorecomic.com, manga online free, free manga, manga reader, manga scans, manga raw, manga, manhwa, manhua",
    HOME_URL: "https://cloudimagewall.xyz",
    HOME_SITENAME: "Dorecomic",
    IMAGE_URL_HTTP: "http://s3.ap-northeast-1.wasabisys.com/storagepongpong",
}