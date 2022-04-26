module.exports = {
    MONGO_IP: process.env.MONGO_IP || "mongo",
    MONGO_PORT: process.env.MONGO_PORT || 27017,
    MONGO_USER: process.env.MONGO_USER,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_FOLDER: process.env.MONGO_FOLDER || "mydb",
    REDIS_URL: process.env.REDIS_URL || "localhost",
    REDIS_PORT: process.env.REDIS_PORT || 6379,

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "dwajvm53v",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_CLOUD_NAME || "485633522843934",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_CLOUD_NAME || "gZYmgO8732Xzcms1AJeU1_ReCGU",
    

    UPDATE_PER_MIN: 10,

    IMG_FORMAT: { lg: '-large.jpeg', md: '-medium.jpeg', sm: '-small.webp' },
    TEST: process.env.TEST || "test",
    HOME_TITLE: "Read Manga Online - Dorecomic",
    HOME_DESCRIPTION: "Read manga online free at Dorecomic with fastest update",
    DETAIL_PAGE_DESCRIPTION: "with high quality images, update fastest at",
    HOME_KEYWORDS: "read manga online, dorecomic, dorecomic.com, manga online free, free manga, manga reader, manga scans, manga raw, manga, manhwa, manhua",
    HOME_URL: "https://cloudimagewall.xyz",
    HOME_SITENAME: "Dorecomic",
    
    IMAGE_URL: "https://res.cloudinary.com/dwajvm53v/image/upload",
    IMAGE_URL_HTTP: "http://res.cloudinary.com/dwajvm53v/image/upload",
}