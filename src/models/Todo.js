const mongoose = require('mongoose');

/**
 * Todo shema
 */
const TodoSchema = new mongoose.Schema({
    /**
     * Название todo.
     */
    title: {
        type: String,
        required: true,
    },
    /**
     * Описания todo.
     */
    description: {
        type: String,
        required: true,
    },
    /**
     * Изображение todo.
     */
    image: {
        type: String,
    },
    /**
     * userId todo.
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    /**
     * Дата и время создания todo.
     */
    createdAt: {
        type: Date,
        required: true,
    },
    /**
     * Дата и время обновления todo.
     */
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
})


module.exports = mongoose.model("Todo", TodoSchema);