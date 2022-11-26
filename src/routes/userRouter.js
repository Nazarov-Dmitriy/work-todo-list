/** Экспресс-маршрутизатор, предоставляющий маршруты, связанные с пользователем 
 * @module router/users
 * @requires express
 * @requires bcrypt
 * @requires User
 * @requires passport
 * @requires LocalStrategy
 * @requires dotenv
 * @requires verifyUserLogin
 * @requires userLogout
 * @requires SALT
 */

/**
 * express module
 * @const
 */
const express = require('express')

/**
 * Экспресс-маршрутизатор для монтирования пользовательских функций
 * @type {object}
 * @const
 * @namespace userRouter
 */

const router = express.Router()

/**
 * bcrypt module
 * @const
 */
const bcrypt = require('bcrypt');

/**
 * User shema module
 * @const
 */

const User = require('../models/User')

/**
 * Passport JS —  middleware для авторизации 
 * @type {object}
 * @const
 * @namespace passport
 */

const passport = require('passport')

/**
 * LocalStrategy module
 * @const
 */
const LocalStrategy = require('passport-local').Strategy
/**
 * dotenv module
 */
require('dotenv').config();
/**
 * verifyUserLogin -промежуточное по аутентификация пользователя
 * @type {function}
 * @const
 * @namespace verifyUserLogin
 */
const verifyUserLogin = require('../middleware/verifyUserLogin')
/**
 * userLogout - промежуточное по прекращение сеанса работы пользователя
 * @type {function}
 * @const
 * @namespace userLogout
 */
const userLogout = require('../middleware/userLogout')
/**
 * SALT - модификатор входа хэш-функции
 * @type {number}
 * @const
 * @namespace SALT
 */
const SALT = process.env.SALT;


const options = {
    usernameField: "email",
    passwordField: "password",
}


passport.use('local', new LocalStrategy(options, verifyUserLogin))

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser((id, cb) => {
    User.findById(id, (err, user) => {
        if (err) {
            return cb(err)
        }
        cb(null, user)
    })
})

/**
 * Маршрут формы входа.
 * @name get/login
 * @function
 * @memberof module:router/users~userRouter
 * @inner
 * @param {string} path - Express path
 * @param {Response} res 
 * @param {Request} req 
 */

router.get('/login', async (req, res) => {
    try {
        res.render("users/login", {
            status: '',
            user: req.user,
            error: false
        });
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут отправки даных формы входа.
 * @name post/login
 * @function
 * @memberof module:router/users~userRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('users/login', {
                error: info.message,
                status: "error",
                user: req.user
            });
        }

        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            if (info.status === 'ok') {
                res.cookie('token', token, {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true
                });
            }
            return res.render('index', {
                user: user,
                error: false
            });
        });
    })(req, res, next);
})

/**
 * Маршрут регистрации пользователя.
 * @name get/signup
 * @function
 * @memberof module:router/users~userRouter
 * @inner
 * @param {string} path - Express path
 * @param {Response} res 
 * @param {Request} req 
 */
router.get('/signup', async (req, res) => {
    try {
        res.render("users/signup", {
            status: '',
            user: req.user,
        });
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут отправки данных регистрации пользователя.
 * @name post/signup
 * @function
 * @memberof module:router/users~userRouter
 * @inner
 * @param {string} path - Express path
 * @param {Response} res 
 * @param {Request} req 
 */
router.post('/signup', async (req, res) => {
    const {
        email,
        password: plainTextPassword,
        name
    } = req.body;
    const password = await bcrypt.hash(plainTextPassword, Number(SALT));
    await User.create({
            email: email,
            passwordHash: password,
            name: name,
        }).then(resolve => {
            res.render("users/signup", {
                data: {
                    id: resolve._id,
                    email: resolve.email,
                    name: resolve.name,
                },
                status: "ok",
                user: req.user
            });
        })
        .catch(error => {
            res.render("users/signup", {
                error: "email занят",
                status: 'error',
                user: req.user
            });
            throw error
        });
})

/**
 * Маршрут  прекращение сеанса работы пользователя
 * @name get/logout
 * @function
 * @memberof module:router/users~userRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/logout', function (req, res, next) {
    userLogout(req, res, next);
})


module.exports = router