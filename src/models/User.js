const mongoose = require('mongoose');

/**
 * User shema
 */
const UserSchema = new mongoose.Schema({
    /**
     * Email пользователя.
     */
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    /**
     * Хэшированый пароль пользователя.
     */
    passwordHash: {
        type: String,
        required: true,
    },
    /**
     * Имя пользователя.
     */
    name: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('User', UserSchema);