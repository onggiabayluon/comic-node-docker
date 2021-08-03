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
    WASABI_ENDPOINT: process.env.WASABI_ENDPOINT,
    WASABI_BUCKET_NAME: process.env.WASABI_BUCKET_NAME,
    WASABI_REGION: process.env.WASABI_REGION,
    
    UPDATE_PER_MIN: 10
}