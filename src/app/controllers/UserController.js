const User                      = require('../models/User')
const Chapter                   = require('../models/Chapter')
const Pocket                    = require('../models/Pocket');
const Invoice                   = require('../models/Invoice');
const customError               = require('../../util/customErrorHandler')
const bcrypt                    = require('bcrypt');
const passport                  = require('passport');
const { canChangeRole, canDeleteUser, canChangeBannedStatus }         = require('../../config/permissions/users.permission')
const { IMAGE_URL, IMG_FORMAT } = require('../../config/config');

class UserController {

    // login Page
    loginPage(req, res, next) {
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
                    req.flash('error-message', 'You dont have enough permission to change this user role')
                } else {
                    changeRoleAccordingly(user, req, res, next)
                }
            }

            async function changeRoleAccordingly(user, req, res, next) {
                user.role = roleWantToChange
                user
                .save()
                .then(() => {
                    req.flash('success-message', `Change ${user.name} Role to ${roleWantToChange} successfully`)
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
                    req.flash('error-message', 'You dont have enough permission to Delete this user')
                } else {
                    deleteUser(userToDelete, req, res, next)
                }
            }
            async function deleteUser(userToDelete, req, res, next) {
                userToDelete
                .remove()
                .then(() => {
                    req.flash('success-message', `Delete User Successfully`)
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
                    req.flash('error-message', `You dont have enough permission to ${message} this user`)
                } else {
                    changeUserStatus(userToBan, req, res, next)
                }
            }
            async function changeUserStatus(userToBan, req, res, next) {
                userToBan
                .updateOne({banned: statusWantToChange})
                .then(() => {
                    req.flash('success-message', `${message} User Successfully`)
                    res.redirect(`/me/stored/comics/dashboard/${myRole}`)
                })
                .catch(next)
            }
        } catch (err) {
            next(err)
        }
    }

    // Give coin
    giveCoin(req, res, next) {
        const   $coinToGive = req.body.coinValue,
                $user_id = req.body.user_id 
        User.updateOne(
            { _id: $user_id },
            { $inc: { coin: $coinToGive } }
        )
        .then(result => {
            if (result.nModified) {
                req.flash('success-message', `ADD ${$coinToGive} Coin to User ${$user_id} Successfully`)
                res.redirect('back')
            } else {
                req.flash('error-message', `Cannot give coin to this User ${$user_id}`)
                res.redirect('back')
            }
        })
        .catch(next)
    };

    unlockChapter(req, res, next) {
        if (!req.user) return next(new customError("You have not logged In yet", 401))

        const   $user_id = req.user._id,
                $user_current_coin = req.user.coin,
                $chapter_id = req.body.chapter_id,
                $slug = req.body.chapterSlug,
                $chapterName = req.body.chapter

        
        const newPockets = {
            comicSlug: $slug,
            chapters: $chapter_id
        }

        const $find = { "user_id": $user_id, "pockets.comicSlug" : $slug }
        const $addToSet = { $addToSet: { "pockets.$.chapters": $chapter_id } }
        
        
        main()
        .then(result => { 
            if(!result) return; 
            else Chapter
            .findOne({ comicSlug: $slug, chapter: $chapterName })
            .lean()
            .then(chapter => {
                res.send({
                    chapterdoc: chapter,
                    storage_url: IMAGE_URL,
                    img_format: IMG_FORMAT
                })
                // res.status(200).render('template/chapter.detail.template.hbs', {
                //     layout: 'fetch_layout',
                //     isFree: true,
                //     chapter: chapter,
                //     img_url: IMAGE_URL,
                // })
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))

        async function main () {
            try {
                const [chapter_coin, error1] = await getChapterCoin()
                if (error1) throw new customError(error1, 404)

                const [subtractResult, error2] = await subtractUserCoin(chapter_coin)
                if (error2) throw new customError(error2, 403)

                const [pushResult, error3] = await pushNewPocket()
                if (error3) throw new customError(error3, 404)
                
                const [createResult, error4] = await createInvoice(chapter_coin)
                if (error4) throw new customError(error4, 404)

                return { message: `Unlock chapter successfully`, status: 200 }

            } catch (err) { next(err) }
        };
        
        async function getChapterCoin() {
            return Chapter
            .findOne({ _id: $chapter_id })
            .select("coin -_id")
            .lean()
            .then(result => {
                if (!result) return [null, "Error happen when find Chapter in db"]
                else return [result.coin.required, null]
            })
            .catch(err => { return [null, err] })
        };

        async function subtractUserCoin(chapter_coin) {
            if ($user_current_coin - chapter_coin < 0) return [null, "You dont have enough coin to unlock this chapter"]
            return User
            .updateOne(
                { _id: $user_id },
                { $set: { coin: $user_current_coin - chapter_coin }}
            )
            .then(result => {
                if (result.nModified === 0) return [null, "Error happen when Substract user coin in db"]
                else return [result.nModified, null]
            })
            .catch(err => { return [null, err] })
        };

        async function pushNewPocket() {
            const isExist = await Pocket.findOne($find).countDocuments()
            if (isExist) return update()
            else return insert()

            function insert() {
                return Pocket.updateOne(
                    { "user_id": $user_id },
                    { $push: { "pockets": newPockets } },
                    { upsert: true }
                )
                .then(result => {
                    if (result.ok !== 1) return [null, "Error happen when Insert new Pocket in db"]
                    else return [result.nModified, null]
                })
                .catch(err => { return [null, err] })
            };
            
            function update() {
                return Pocket.updateOne( $find, $addToSet )
                .then(result => {
                    if (result.ok !== 1) return [null, "Error happen when Push Pocket in db"]
                    else return [result.nModified, null]
                })
                .catch(err => { return [null, err] })
            }
        };
        
        async function createInvoice(chapter_coin) {
            const invoice = {
                user_id: $user_id,
                comicSlug: $slug,
                chapter: {
                    chapterName: $chapterName,
                    chapter_id: $chapter_id
                },
                coin: chapter_coin,
            }
            return Invoice
            .create(invoice)
            .then(result => {
                if (!result) return [null, "Error happen when create Invoice in db"]
                else return [result, null]
            })
            .catch(err => { return [null, err] })
        };

        
        
    };
}

module.exports = new UserController();
