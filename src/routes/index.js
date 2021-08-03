// routes: index.js --> courses.js --> controller: coursesController.js

const siteRouter = require('./site');
const comicRouter = require('./comic');
const meRouter = require('./me');
const userRouter = require('./user');
const fetchRouter = require('./fetch');


function route(app) {

    //đang chọn route đầu tiên
    //Action ---> Dispatcher ---> Function handler

    // Manga Page
    app.use('/comic', comicRouter);

    // Me Page
    app.use('/me', meRouter);

    // users Page
    app.use('/users', userRouter);

    // users Page
    app.use('/fetch', fetchRouter);
    
    // Home Page
    app.use('/', siteRouter);

    // Error
    app.use((req, res, next) => {
        const error = new Error("Not found");
        error.status = 404;
        next(error);
    });
    app.use((error, req, res, next) => {
        res.status(error.status || 500)
        res.json({
            error: {
                message: error.message,
                status: error.status || 500,
            }
        });
    });
}

module.exports = route;
