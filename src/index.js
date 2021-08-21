// dotenv
require('dotenv').config()
//
const path          = require('path');
const express       = require('express');
const cookieParser  = require('cookie-parser')
const morgan        = require('morgan');
const compression   = require('compression');
const session       = require('express-session');
const passport      = require('passport');
const flash         = require('connect-flash')
const sortMiddleWare= require('./app/middlewares/meControllerSort.middleware')
const favicon       = require('serve-favicon');
const CalcTimeEnglish      = require('./config/middleware/CalcTimeEnglish')
const methodOverride = require('method-override');
const redis     = require(path.resolve('./src/config/redis'))
const auto      = require(path.resolve('./src/util/autoUpdateView.js'))
const cors      = require("cors");
const CronJob   = require('cron').CronJob;
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const { UPDATE_PER_MIN } = require("./config/config")

// db and route
const route = require('./routes');
const db    = require('./config/db');



// CronJob 
const MIN = UPDATE_PER_MIN
const job = new CronJob(`0 */${MIN} * * * *`, function () {
    auto.handlingUpdate().then(results => console.log(results));
}, null, true, 'Asia/Ho_Chi_Minh');
job.start();


// connect to redis
redis.connect();
// connect to DB
db.connect();
const app   = express();
const port = process.env.PORT || 3000;


// Socket io
const server = require('http').createServer(app);
const io     = require('socket.io')(server);

io.on('connection', client => {
    console.log('Users Connected!')

    client.on('join', function(room) {
        client.join(room);
        // console.log("joined room: " + room)
        
        client.on('new_comment', comment => {
            io.in(room).emit('new_comment', comment)
        })
        client.on('new_reply', reply => {
            io.in(room).emit('new_reply', reply)
        })
    
        client.on('delete_comment', comment_id => {
            io.in(room).emit('delete_comment', comment_id)
        })
    
        client.on('delete_reply', reply_id => {
            io.in(room).emit('delete_reply', reply_id)
        })
    
        client.on('edited_comment', comment_id => {
            io.in(room).emit('edited_comment', comment_id)
        })
    
        client.on('edited_reply', reply_id => {
            io.in(room).emit('edited_reply', reply_id)
        })
    });
    

    
    
});



// sessionConfig
const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie : {
        sameSite: 'strict',
        maxAge: 2592000,
        httpOnly: true,
        secure: false
    }
};
app.use(session(sessionConfig));


// Cors and Proxy
app.set('trust proxy', true); // trust first proxy
app.use(cors())
//❌
// if (process.env.NODE_ENV === 'production') {
//     app.set('trust proxy', 1); // trust first proxy
//     app.use(cors())
//     sessionConfig.cookie.secure = true; // serve secure cookies
//     sessionConfig.store: new sessionStore() 
// }


// Passport Config
require('./config/auth/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_message = req.flash('success-message')
    res.locals.error_message = req.flash('error-message')
    res.locals.error = req.flash('error');
    next();
})

// Compression
app.use(compression({
    level: 6,
    threshold: 0, // 100 * 1000 Dưới 100KB không bị compress
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            // don't compress responses with this request header
            return false
        } else {
            return compression.filter(req, res)
        }
    }
}))

app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        const isRevved = /[a-f0-9]{7,}/.exec(path)
        res.setHeader('Cache-Control', `max-age=${isRevved ? 31536000 : 0}`);
    }
}));

//add cái này cho form (post) parse ra dạng kiểu dữ liệu cho console.log
app.use(express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

// Cookie Parser
app.use(cookieParser())

// HTTP logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// method override
app.use (methodOverride('_method'));

// Custom MiddleWare
app.use(sortMiddleWare)
//Template engine: express handlebars (add partial parts)
app.engine(
    'hbs',
    handlebars.create({
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, "resources/views/layouts"),
        partialsDir: path.join(__dirname, "resources/views/partials"),
        extname: '.hbs',
          //Hàm tự thêm vào nhờ express handlebars
          helpers: {
            setVar: (varName, varValue, options) => {
                if (!options.data.root) {
                    options.data.root = {};
                }
                options.data.root[varName] = varValue;
            },
            getValues: (object, index) => {
               return object[index]
            },
            getObjValues: (object, key) => {
                let obj = (Array.isArray(object))
                ? object.shift()
                : object
               return obj[`${key}`]
            },
            CalcTimeEnglish: (time) => CalcTimeEnglish(time),
            minus: (a,b) => a - b,
            sum: (a, b) =>  a + b,
            limit: (arr, limit) => {
                if (!Array.isArray(arr)) { return []; }
                return arr.slice(0, limit);
            },
            limitFrom: (arr, startLimit, endLimit) => {
                if (!Array.isArray(arr)) { return []; }
                return arr.slice(startLimit, endLimit);
            },
            replaceHyphenIntoHashmark: (str) => {
                str = (str) ? str.toString().replace(/chapter-/g, '#') : '';
                return str && str[0].toUpperCase() + str.slice(1);
            },
            replaceHyphenIntoSpace: (str) => {
                str = (str) ? str.toString().replace(/-/g, ' ') : '';
                return str && str[0].toUpperCase() + str.slice(1);// replace '-' -> space 
            },
            chapterText: (str) => {
                str = str.toString().replace(/-/g, ' ').replace("apter", '. ');
                return str && str[0].toUpperCase() + str.slice(1);
            },
            encodeMyString: (text) => { 
                return new Handlebars.SafeString(text);
            }
            ,
            breakWords: (str) => {
                var words = str.trim().split(' ')
                if (words.length == 2) {
                    var result = `${Handlebars.escapeExpression(words[0])} </br> ${Handlebars.escapeExpression(words[1])}`
                    return new Handlebars.SafeString(result);
                } 
                if (words.length == 3) {
                    var result = `${Handlebars.escapeExpression(words[0] + ' ' + words[1])} </br> ${Handlebars.escapeExpression(words[2])}`
                    return new Handlebars.SafeString(result);
                }
                return str
            },
            ifCond: (a,operator,b,options) => {
                switch (operator) {
                    case '%':
                        a++
                        return (a % b == 0) ? options.fn(this) : options.inverse(this);
                    case '!%':
                        a++
                        return (a % b != 0) ? options.fn(this) : options.inverse(this);
                    case '== (string)':
                        a = (!a) ? null : a.toString()
                        b = (!b) ? null : b.toString()
                        return (a == b) ? options.fn(this) : options.inverse(this);
                    case '==':
                        return (a == b) ? options.fn(this) : options.inverse(this);
                    case '===':
                        return (a === b) ? options.fn(this) : options.inverse(this);
                    case '!=':
                        return (a != b) ? options.fn(this) : options.inverse(this);
                    case '!==':
                        return (a !== b) ? options.fn(this) : options.inverse(this);
                    case '<':
                        return (a < b) ? options.fn(this) : options.inverse(this);
                    case '<=':
                        return (a <= b) ? options.fn(this) : options.inverse(this);
                    case '>':
                        return (a > b) ? options.fn(this) : options.inverse(this);
                    case '>=':
                        return (a >= b) ? options.fn(this) : options.inverse(this);
                    case '&&':
                        return (a && b) ? options.fn(this) : options.inverse(this);
                    case '||':
                        return (a || b) ? options.fn(this) : options.inverse(this);
                    default:
                        return options.inverse(this);
                }
            },
            times: (n, block) => {
                var accum = '';
                for(var i = 1; i <= n; ++i)
                    accum += block.fn(i);
                return accum;
            },
            sortable: (sortField, sortType) => {
                //Xem field click vào có giống _sort.column không
                // nếu = thi dùng sortStype.type này
                // không thì dùng icon default
                // else các sortfield khác thì dùng default
                const sort = sortField === sortType.column ?  sortType.type : 'default'
                
                const iconsTitle = {
                    default: ` 
                    <svg xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 400 512"><!-- Font Awesome Pro 5.15.1 by 
                            @fontawesome - https://fontawesome.com License - 
                            https://fontawesome.com/license (Commercial License) -->
                            <path class="view-icon-svg" d="M41 288h238c21.4 0 32.1 25.9 17 41L177 
                            448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 
                            64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 
                            32.1-25.9 17-41z"/>
                        </svg>`,
                    asc: ` 
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><defs><style>.fa-secondary{opacity:.4}</style></defs><path d="M276 192h152a20 20 0 0 0 20-20V52a20 20 0 0 0-20-20H276a20 20 0 0 0-20 20v120a20 20 0 0 0 20 20zm208 64H284a28 28 0 0 0-28 28v168a28 28 0 0 0 28 28h200a28 28 0 0 0 28-28V284a28 28 0 0 0-28-28z" class="view-icon-svg fa-secondary"/><path d="M107.31 36.69a16 16 0 0 0-22.62 0l-80 96C-5.35 142.74 1.77 160 16 160h48v304a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V160h48c14.21 0 21.38-17.24 11.31-27.31z" class="view-icon-svg fa-primary"/>
                        </svg>`,
                    desc: ` 
                    <svg xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><defs><style>.fa-secondary{opacity:.4}</style></defs><path d="M275.9 192h152.2a20 20 0 0 0 19.9-20V52a20 20 0 0 0-19.9-20H275.9A20 20 0 0 0 256 52v120a20 20 0 0 0 19.9 20zM484 256H284a28 28 0 0 0-28 28v168a28 28 0 0 0 28 28h200a28 28 0 0 0 28-28V284a28 28 0 0 0-28-28z" class="view-icon-svg fa-secondary"/><path d="M176 352h-48V48a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v304H16c-14.19 0-21.37 17.24-11.29 27.31l80 96a16 16 0 0 0 22.62 0l80-96C197.35 369.26 190.22 352 176 352z" class="view-icon-svg fa-primary"/>
                        </svg>`
                }

                const iconsTime = {
                    default: `
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 448 512"><!-- Font Awesome Pro 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path class="stopwatch view-icon-svg" d="M393.3 141.3l17.5-17.5c4.7-4.7 4.7-12.3 0-17l-5.7-5.7c-4.7-4.7-12.3-4.7-17 0l-17.5 17.5c-35.8-31-81.5-50.9-131.7-54.2V32h25c6.6 0 12-5.4 12-12v-8c0-6.6-5.4-12-12-12h-80c-6.6 0-12 5.4-12 12v8c0 6.6 5.4 12 12 12h23v32.6C91.2 73.3 0 170 0 288c0 123.7 100.3 224 224 224s224-100.3 224-224c0-56.1-20.6-107.4-54.7-146.7zM224 480c-106.1 0-192-85.9-192-192S117.9 96 224 96s192 85.9 192 192-85.9 192-192 192zm4-128h-8c-6.6 0-12-5.4-12-12V172c0-6.6 5.4-12 12-12h8c6.6 0 12 5.4 12 12v168c0 6.6-5.4 12-12 12z"/>
                        </svg>`,
                    asc: `
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path class="hourglass-start view-icon-svg" d="M360 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24 0 90.965 51.016 167.734 120.842 192C75.016 280.266 24 357.035 24 448c-13.255 0-24 10.745-24 24v16c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24 0-90.965-51.016-167.734-120.842-192C308.984 231.734 360 154.965 360 64c13.255 0 24-10.745 24-24V24c0-13.255-10.745-24-24-24zm-64 448H88c0-77.458 46.204-144 104-144 57.786 0 104 66.517 104 144z"/>
                        </svg>`,
                    desc: `
                    <svg xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path class="hourglass-end view-icon-svg" d="M360 64c13.255 0 24-10.745 24-24V24c0-13.255-10.745-24-24-24H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24 0 90.965 51.016 167.734 120.842 192C75.016 280.266 24 357.035 24 448c-13.255 0-24 10.745-24 24v16c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24 0-90.965-51.016-167.734-120.842-192C308.984 231.734 360 154.965 360 64zM192 208c-57.787 0-104-66.518-104-144h208c0 77.945-46.51 144-104 144z"/>
                        </svg>`
                }

                if (sortField === "title") {
                    var iconForField = iconsTitle
                } else { var iconForField = iconsTime }
               
                const tooltiptexts = {
                    default: 'Giảm dần',
                    asc: 'Tăng dần',
                    desc: 'Giảm dần',
                }

                const types = {
                    default: 'desc',
                    asc: 'desc',
                    desc: 'asc',
                }

                // sortype là giá trị truyền vào
                const icon = iconForField[sort] //icons[default] 

                const tooltiptext = tooltiptexts[sort] //icons[default] 
                
                const type = types[sort] //types[default]

                return  `<a href="?_sort&column=${sortField}&type=${type}" 
                class="mr-2 view-icon tooltipIcon" >
                <span class="mb-2 tooltiptext"> ${tooltiptext} </span>
                ${icon}
                </a>`
            }
        }
    }).engine,
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views')); //__dirname/resources/views

//Routes init
route(app);

server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
