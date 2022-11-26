/**  Функция прекращения сеанса пользователя
 * @module userLogout
 */

/**
 * Функция аутентификации пользователя
 * @name userLogout
 * @function
 * @inner
 * @param {Request} req 
 * @param {Response} res 
 * @param {function} next 
 * @param {string} message - сообщение об истечение сессии 
 */
const userLogout = (req, res, next, message) => {
    req.logout(function (err) {
        if (err) {
            next(err);
        }
        res.cookie('token', '', {
            maxAge: -1,
        });
        res.render("index", {
            user: req.user,
            error: message || false
        });
    });
}

module.exports = userLogout