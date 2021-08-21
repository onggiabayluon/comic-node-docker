module.exports = {
    // MONGO_IP: process.env.MONGO_IP || "mongo",
    // MONGO_PORT: process.env.MONGO_PORT || 27017,
    // MONGO_USER: process.env.MONGO_USER,
    // MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    // MONGO_FOLDER: process.env.MONGO_FOLDER || "mydb",
    // REDIS_URL: process.env.REDIS_URL || "redis",
    // REDIS_PORT: process.env.REDIS_PORT || 6379,

    // WASABI_ACCESS_KEY_ID: process.env.WASABI_ACCESS_KEY_ID,
    // WASABI_SECRET_ACCESS_KEY: process.env.WASABI_SECRET_ACCESS_KEY,
    // WASABI_ENDPOINT: process.env.WASABI_ENDPOINT || 's3.ap-northeast-1.wasabisys.com',
    // WASABI_BUCKET_NAME: process.env.WASABI_BUCKET_NAME || "cloudimagewallbucket",
    // WASABI_REGION: process.env.WASABI_REGION || "ap-northeast-1",
    // IMAGE_URL: process.env.URL || "https://s3.ap-northeast-1.wasabisys.com/cloudimagewallbucket",

    MONGO_IP: process.env.MONGO_IP || "mongo",
    MONGO_PORT: process.env.MONGO_PORT || 27017,
    MONGO_USER: process.env.MONGO_USER || 'ducchuy',
    MONGO_PASSWORD: process.env.MONGO_PASSWORD || 'mypassword',
    MONGO_FOLDER: process.env.MONGO_FOLDER || "mydb",
    REDIS_URL: process.env.REDIS_URL || "localhost",
    REDIS_PORT: process.env.REDIS_PORT || 6379,

    WASABI_ACCESS_KEY_ID: process.env.WASABI_ACCESS_KEY_ID || '9FP3U7TYG1CK3QRBI1NC',
    WASABI_SECRET_ACCESS_KEY: process.env.WASABI_SECRET_ACCESS_KEY || 'HehGeUmLyGiMpbRzK1OyDp9IHtvr0eG2XX3N0O1h',
    WASABI_ENDPOINT: process.env.WASABI_ENDPOINT || 's3.ap-northeast-1.wasabisys.com',
    WASABI_BUCKET_NAME: process.env.WASABI_BUCKET_NAME || "cloudimagewallbucket",
    WASABI_REGION: process.env.WASABI_REGION || "ap-northeast-1",
    IMAGE_URL: process.env.URL || "https://s3.ap-northeast-1.wasabisys.com/cloudimagewallbucket",
    
    // DEV testing ONLY
    // MONGO_IP: process.env.MONGO_IP || "mongo",
    // MONGO_PORT: process.env.MONGO_PORT || 27017,
    // MONGO_USER: process.env.MONGO_USER || 'ducchuy',
    // MONGO_PASSWORD: process.env.MONGO_PASSWORD || 'mypassword',
    // MONGO_FOLDER: process.env.MONGO_FOLDER || "mydb",
    // REDIS_URL: process.env.REDIS_URL || "redis",
    // REDIS_PORT: process.env.REDIS_PORT || 6379,

    // WASABI_ACCESS_KEY_ID: process.env.WASABI_ACCESS_KEY_ID || '9FP3U7TYG1CK3QRBI1NC',
    // WASABI_SECRET_ACCESS_KEY: process.env.WASABI_SECRET_ACCESS_KEY || 'HehGeUmLyGiMpbRzK1OyDp9IHtvr0eG2XX3N0O1h',
    // WASABI_ENDPOINT: process.env.WASABI_ENDPOINT || 's3.ap-northeast-1.wasabisys.com',
    // WASABI_BUCKET_NAME: process.env.WASABI_BUCKET_NAME || "cloudimagewallbucket",
    // WASABI_REGION: process.env.WASABI_REGION || "ap-northeast-1",
    // IMAGE_URL: process.env.URL || "https://s3.ap-northeast-1.wasabisys.com/cloudimagewallbucket",

    
    UPDATE_PER_MIN: 10,

    HOME_TITLE: "Read Manga Online - Dorecomic",
    HOME_DESCRIPTION: "Read manga online free at Dorecomic with fastest update",
    HOME_KEYWORDS: "read manga online, dorecomic, dorecomic.com, manga online free, free manga, manga reader, manga scans, manga raw, manga, manhwa, manhua",
    HOME_URL: "https://139.59.240.138:3000",
    HOME_SITENAME: "Dorecomic"
}