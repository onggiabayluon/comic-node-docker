const User                      = require('../models/User')
const bcrypt                    = require('bcrypt');
const passport                  = require('passport');
const { canChangeRole, canDeleteUser, canChangeBannedStatus }         = require('../../config/permissions/users.permission')
class UserController {

    // login Page
    loginPage(req, res, next) {
        res.setHeader('Cache-Control', 'private, max-age=0');
        res.render('users/login', {
            layout: 'login_register_layout',
            // referer: req.headers.referer || req.headers.referrer,
            title: 'Sign in to your Account'
        })
    }

    // Login
    login(req, res, next) {
        let referer = req.session.redirectTo || '/'
        delete req.session.redirectTo;
        passport.authenticate('local', {
        successRedirect: referer,
        failureRedirect: '/users/login',
        failureFlash: true
        })(req, res, next);
    };

    // Login Google
    loginGoogle(req, res, next) {
        let referer = req.body.referer || '/'
        delete req.session.redirectTo;
        passport.authenticate('google', {
        successRedirect: referer,
        failureRedirect: '/users/login',
        failureFlash: true
        })(req, res, next);
    };
    
    // Login Facebook
    loginFacebook(req, res, next) {
        let referer = req.body.referer || '/'
        delete req.session.redirectTo;
        passport.authenticate('facebook', {
        successRedirect: referer,
        failureRedirect: '/users/login',
        failureFlash: true
        })(req, res, next);
    };
    
    // Logout
    logout(req, res) {
        req.logout();
        req.flash('success-message', 'You are logged out');
        res.redirect('/users/login');
    };

    // Register Page
    registerPage(req, res, next) {
        res.setHeader('Cache-Control', 'private, max-age=0');
        res.render('users/login', {
            registerSubmit: true,
            layout: 'login_register_layout',
            title: 'Register new Account'
        })
    }
    
    // Register
    register(req, res, next) {
        const layout = "login_register_layout"
        const { name, password, password2 } = req.body;
        let errors = [];

        checkInput(name, password, password2)

        if (errors.length > 0) return renderView(true)
        return createUser(name)

        function renderView(isRegisterPage) {
            res.render('users/login', {
                registerSubmit: isRegisterPage,
                layout: layout,
                errors,
                name,
                password,
                password2
            })
        };

        function checkInput(name, password, password2) {
            if (!name || !password || !password2) {
                errors.push({ msg: 'Please enter all fields' });
            }

            if (password != password2) {
                errors.push({ msg: 'Passwords do not match' });
            }

            if (password.length < 6) {
                errors.push({ msg: 'Password must be at least 6 characters' });
            }
        }
        
        function createUser(name) {
            User.findOne({name: name})
            .then(user => {
                if (user) {
                    errors.push({ msg: 'This Name is already taken' });
                    return renderView(true)
                } else {
                    const newUser = new User({
                        name,
                        password
                      });
              
                      bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                          if (err) throw err;
                          newUser.password = hash;
                          newUser
                            .save()
                            .then(user => {
                                let successMessage = 'You are now registered and can log in'
                                res.render('users/login', {
                                    layout: layout,
                                    name,
                                    password,
                                    success_message: successMessage,
                                })
                            })
                            .catch(next);
                        });
                      });
                }
            })
            .catch(next)
        }

    }

    // Upgrade Role to extraAdmin
    async changeRole(req, res, next) {
        try {
            var roleWantToChange = req.params.role // upToExtraAdmin || downToUser
            var myRole = req.user.role
            var user = await User.findOne({ _id: req.params.userId })

            authChangeRole(user, req, res, next)
        
            async function authChangeRole(user, req, res, next) {
                var check = await canChangeRole(user, myRole)
                if (!check) {
                    res.status(401).redirect(`/me/stored/comics/dashboard/${myRole}`)
                    req.flash('error-message', 'Bạn không đủ điều kiện để thay đổi Role của người này')
                } else {
                    changeRoleAccordingly(user, req, res, next)
                }
            }

            async function changeRoleAccordingly(user, req, res, next) {
                user.role = roleWantToChange
                user
                .save()
                .then(() => {
                    req.flash('success-message', `Thay đổi Role của ${user.name} sang ${roleWantToChange} thành công`)
                    res.redirect(`/me/stored/comics/dashboard/${myRole}`)
                })
                .catch(next)
            }

        } catch (err) {
            next(err)
        }
    }

    // Delete User
    async deleteUser(req, res, next) {
        try {
            var myRole = req.user.role
            var userToDelete = await User.findOne({ _id: req.params.userId })

            authDeletePermission(userToDelete, req, res, next)
        
            async function authDeletePermission(userToDelete, req, res, next) {
                var check = await canDeleteUser(userToDelete, myRole)
                if (!check) {
                    res.status(401).redirect(`/me/stored/comics/dashboard/${myRole}`)
                    req.flash('error-message', 'Bạn không đủ điều kiện để Xóa người này')
                } else {
                    deleteUser(userToDelete, req, res, next)
                }
            }
            async function deleteUser(userToDelete, req, res, next) {
                userToDelete
                .remove()
                .then(() => {
                    req.flash('success-message', `Xóa User thành công`)
                    res.redirect(`/me/stored/comics/dashboard/${myRole}`)
                })
                .catch(next)
            }
        } catch(err) {
            next(err)
        }
    }

    // Ban User
    async changeBannedStatus(req, res, next) {
        try {
            var statusWantToChange = req.params.banType // true || false
            var message = (statusWantToChange === 'true') ? 'Ban' : 'unBan'
            var myRole = req.user.role
            var userToBan = await User.findOne({ _id: req.params.userId })

            authBanPermission(userToBan, req, res, next)
        
            async function authBanPermission(userToBan, req, res, next) {
                var check = await canChangeBannedStatus(userToBan, myRole)
                if (!check) {
                    res.status(401).redirect(`/me/stored/comics/dashboard/${myRole}`)
                    req.flash('error-message', `Bạn không đủ điều kiện để ${message} người này`)
                } else {
                    changeUserStatus(userToBan, req, res, next)
                }
            }
            async function changeUserStatus(userToBan, req, res, next) {
                userToBan
                .updateOne({banned: statusWantToChange})
                .then(() => {
                    req.flash('success-message', `${message} User thành công`)
                    res.redirect(`/me/stored/comics/dashboard/${myRole}`)
                })
                .catch(next)
            }
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new UserController();
