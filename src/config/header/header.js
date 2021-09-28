module.exports = {

    noCache: function (req, res, next) {
        // if (req.url === '/' || req.url === '/login') return next();
        res.setHeader('Cache-Control', 'private, max-age=0, no-cache');
        return next();
    },

    cache: function (ttl) {
        return function(req, res, next) {
            res.setHeader('Cache-Control', `public, max-age=${ttl}`);
            return next();
        }
    },

  };