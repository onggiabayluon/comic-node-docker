module.exports = {

    //Vấn đề của hanhdle bar
    //chuyển object của mongo(object literal => object thường)
    //thì mới sủ dụng this.object được
    //TH là array nên xài map 
    multiMongooseToObject: function (mongooseArray) {
        return mongooseArray.map(mongooseArray => mongooseArray.toObject());
    },
    singleMongooseToObject: function (mongoose) {
        return mongoose ? mongoose.toObject() : mongoose;
    } //nếu có thằng này thì return mongoose.toObject không thì return chính nó

};