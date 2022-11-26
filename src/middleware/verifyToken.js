/**  Функция проверки валидацидности токена
 * @module verifyToken
 * @requires JWT_SECRET
 * @requires jwt
 */
const JWT_SECRET = process.env.jwt;
const jwt = require('jsonwebtoken');

/**
 * Функция валидации токена
 * @name verifyUserLogin
 * @function
 * @inner
 * @param {string} token - token пользователя
 */
const verifyToken = (token) => {
    try {
        const verify = jwt.verify(token, JWT_SECRET);
        if (verify.type === 'user') {
            return true;
        } else {
            return false
        };
    } catch (error) {
        console.log(JSON.stringify(error), "error");
        return false;
    }
}

module.exports = verifyToken