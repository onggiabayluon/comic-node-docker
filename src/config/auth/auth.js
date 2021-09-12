module.exports = {
    // ensureAuthenticated để xác nhận user đã log in 
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
        req.flash('error-message', 'Bạn phải đăng nhập để xem nội dung này');
        res.status(403).redirect('/users/login'); 
    },

    /**
     * authRole để xác nhận admin
     * @param { admin || extraAdmin } ROLE 
     * @returns 
     */ 
    authRole(roles) {
      return function(req, res, next) {
        const filtered = roles.split(':').filter(role => role === req.user?.role);
        if (filtered.length > 0) {
          // console.log(`${req.user.role} ${req.user.name} is qualified`)
          return next();
        }
        req.flash('error-message', `Bạn phải đăng nhập bằng ${roles} để xem nội dung này`);
        res.status(401).redirect('/');
      }
    },
    
    // forwardAuthenticated để tránh trường hợp đã đăng nhập rồi mà user còn cố gắng vào page login
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        req.session.redirectTo = req.headers.referer;
        return next();
      }
      res.status(401).redirect('/');      
    },

  };