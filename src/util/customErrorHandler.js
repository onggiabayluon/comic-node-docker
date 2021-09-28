class CustomError extends Error {
    constructor(message, status, withoutLazyload) {
        super(message);
        this.status = status;
        this.withoutLazyload = withoutLazyload;
    }
}

module.exports = CustomError;