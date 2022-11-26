/**  Функция связанная с аутентификации пользователя
 * @module verifyUserLogin
 * @requires bcrypt
 * @requires dotenv
 * @requires UserModels
 * @requires  JWT_SECRET
 * @requires jwt
 */

const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/User')
const JWT_SECRET = process.env.jwt;
const jwt = require('jsonwebtoken');

/**
 * Функция аутентификации пользователя
 * @name verifyUserLogin
 * @function
 * @inner
 * @param {string} email - email пользователя
 * @param {string} password - password пользователя
 * @param {callback} done - 
 */
 const verifyUserLogin = async (email, password, done) => {
    try {
        const user = await User.findOne({
            email
        }).lean()
        if (!user) {
            return done(null, false, {
                status: 'error',
                error: 'Пользователя не существует'
            })
        }
        if (await bcrypt.compare(password, user.passwordHash)) {
            token = jwt.sign({
                id: user._id,
                username: user.email,
                type: 'user'
            }, JWT_SECRET, {
                expiresIn: '1h'
            })
            return done(null, user, {
                status: 'ok',
                data: token,
            })
        }
        return done(null, false, {
            message: 'Не правильный пароль'
        })
    } catch (error) {
        return done(error)
    }
}

module.exports = verifyUserLogin 