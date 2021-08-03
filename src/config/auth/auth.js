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
     * @param { admin || basic } ROLE 
     * @returns 
     */ 
    authRole(ROLE) {
      return function(req, res, next) {
        if (req.user.role == ROLE) {
          console.log(`is ${ROLE}`)
          return next();
        }
        req.flash('error-message', `Bạn phải đăng nhập bằng ${ROLE} để xem nội dung này`);
        res.status(401).redirect('/');
      }
    },
    
    // forwardAuthenticated để tránh trường hợp đã đăng nhập rồi mà user còn cố gắng vào page login
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.status(401).redirect('/');      
    }
  };