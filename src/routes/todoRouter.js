/** Экспресс-маршрутизатор, предоставляющий маршруты, связанные с todo
 * @module router/todo
 * @requires express
 * @requires verifyToken
 * @requires fileMulter
 * @requires Todo
 * @requires User
 * @requires userLogout
 * @requires moment
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
 * @namespace todoRouter
 */
const router = express.Router()

/**
 * verifyToken -промежуточное по проверки валидности токена
 * @type {function}
 * @const
 * @namespace verifyToken
 */
const verifyToken = require('../middleware/verifyToken')

/**
 * fileMulter -промежуточное по обрабочки файлов
 * @type {function}
 * @const
 * @namespace fileMulter
 */
const fileMulter = require('../middleware/file')

/**
 * Todo shema module
 * @const
 */
const Todo = require('../models/Todo')

/**
 * User shema module
 * @const
 */
const User = require('../models/User')

/**
 * userLogout - промежуточное по прекращение сеанса работы пользователя
 * @type {function}
 * @const
 * @namespace userLogout
 */
const userLogout = require('../middleware/userLogout')

/**
 * moment библиотека работы со временем
 * @const
 */
const moment = require('moment');

/**
 * @const {string}
 */
let message = 'Пожалуйста авторизуйтиесь сессия истекла'
moment.locale('ru');

/**
 * Маршрут главной страницы.
 * @name get/
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', (req, res, next) => {
    try {
        const {
            token
        } = req.cookies;
        if (verifyToken(token)) {
            res.render("index", {
                user: req.user,
                error: false
            });
        } else {
            userLogout(req, res, next, message);
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут получения списка todo-листа.
 * @name get/api/todo
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/api/todo', async (req, res, next) => {
    const data = []
    const todoList = await Todo.find().select('-__v');

    const promise = todoList.map(async (item) => {
        await User.findById(item.userId)
            .then(res =>
                data.push({
                    id: item._id.toString(),
                    title: item.title,
                    description: item.description,
                    image: item.image,
                    user: {
                        id: item.userId.toString(),
                        name: res.name
                    },
                    createdAt: moment(item.createdAt).format('LLL'),
                    updatedAt: moment(item.updatedAt).format('LLL'),
                }))
    })
    await Promise.all(promise)
    try {
        const {
            token
        } = req.cookies;
        if (verifyToken(token)) {
            res.render("todo/index", {
                title: "Задачи",
                todo: {
                    data: data,
                    status: "ok",
                },
                user: req.user,
                search: ''
            });
        } else {
            userLogout(req, res, next, message);
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут формы todo.
 * @name get/api/create
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/api/create', async (req, res, next) => {
    try {
        const {
            token
        } = req.cookies;
        if (verifyToken(token)) {
            res.render("todo/create", {
                title: "Создать задачу",
                todo: '',
                user: req.user
            });
        } else {
            userLogout(req, res, next, message);
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут отправки формы todo.
 * @name post/api/create
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - FileMulter middleware.
 * @param {callback} middleware - Express middleware.
 */
router.post('/api/create', fileMulter.single('images'), async (req, res, next) => {
    const {
        title,
        description,
    } = req.body
    const userId = req.user._id
    const image = req.file.originalname;
    const createdAt = new Date();
    const data = {
        title,
        description,
        image,
        createdAt,
        userId,
    }
    try {
        const {
            token
        } = req.cookies;
        if (verifyToken(token)) {

            Todo.create(data)
            res.redirect('/api/todo')

        } else {
            userLogout(req, res, next, message);
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут страницы todo.
 * @name get/apitodo/id
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/api/todo/:id', async (req, res, next) => {
    const {
        id
    } = req.params
    try {
        const {
            token
        } = req.cookies;
        if (verifyToken(token)) {

            let todo = await Todo.findById(id).
            then(res => ({
                    ...res._doc,
                    createdAt: moment(res.createdAt).format('LLL'),
                    updatedAt: moment(res.updatedAt).format('LLL'),
                    userId: res.userId.toString(),
                }))
                .then(res => {
                    return res
                })

            let author = await User.findById(todo.userId).
            then(res => {
                return res.name
            })

            res.render("todo/view", {
                title: todo.title,
                user: req.user,
                todo: todo,
                author: author
            });
        } else {
            userLogout(req, res, next, message);
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут удаления todo.
 * @name get/api/remove/id
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/api/todo/remove/:id', async (req, res, next) => {
    const {
        id
    } = req.params
    const {
        token
    } = req.cookies;
    try {

        if (verifyToken(token)) {
            await Todo.findOneAndDelete({
                _id: id
            });
            res.redirect('/api/todo')
        } else {
            userLogout(req, res, next, message);
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут формы обновления todo.
 * @name get/api/update/id
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - fileMulter middleware.
 * @param {callback} middleware - Express middleware.
 */
router.get('/api/todo/update/:id', fileMulter.single('images'), async (req, res, next) => {
    const {
        id
    } = req.params
    const {
        token
    } = req.cookies;

    try {
        if (verifyToken(token)) {
            let todo = await Todo.findById(id).
            then(res => ({
                    ...res._doc,
                    userId: res.userId.toString(),
                }))
                .then(res => {
                    return res
                })

            res.render("todo/update", {
                title: 'Редактировать ' + todo.title,
                user: req.user,
                todo: todo,
            });
        } else {
            userLogout(req, res, next, message);
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут отправки данных формы обновления todo.
 * @name post/api/update/id
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - fileMulter middleware.
 * @param {callback} middleware - Express middleware.
 */
router.post('/api/todo/update/:id', fileMulter.single('images'), async (req, res, next) => {

    const {
        id
    } = req.params
    const {
        title,
        description,
    } = req.body
    const {
        token
    } = req.cookies;
    const image = req.file?.originalname;

    try {
        if (verifyToken(token)) {
            await Todo.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    title: title,
                    description: description,
                    image: image,
                    updatedAt: new Date(),
                }
            }, {
                new: true
            });
            res.redirect('/api/todo')
        } else {
            userLogout(req, res, next, message);
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

/**
 * Маршрут формы gjbcrf todo.
 * @name post/api/search
 * @function
 * @memberof module:router/todo~todoRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/api/todo/search', async (req, res, next) => {
    const {
        search
    } = req.body
    const {
        token
    } = req.cookies;
    let paramsSearch = new RegExp(search);
    let searchQuery;
    try {
        if (verifyToken(token)) {

            if (search.length === 24) {
                searchQuery = await Todo.find({
                    $or: [{
                            title: {
                                $regex: paramsSearch,
                                $options: 'i'
                            }
                        },
                        {
                            description: {
                                $regex: paramsSearch,
                                $options: 'i'
                            }
                        },
                        {
                            userId: new ObjectId(search)

                        }
                    ]
                }).select('-__v');
            } else {
                searchQuery = await Todo.find({
                    $or: [{
                            title: {
                                $regex: paramsSearch,
                                $options: 'i'
                            }
                        },
                        {
                            description: {
                                $regex: paramsSearch,
                                $options: 'i'
                            }
                        }
                    ]
                }).select('-__v');
            }

            const promise = searchQuery.map(async (item) => {
                return await User.findById(item.userId)
                    .then(function (res) {
                        return {
                            id: item._id.toString(),
                            title: item.title,
                            description: item.description,
                            image: item.image,
                            user: {
                                id: item.userId.toString(),
                                name: res.name
                            },
                            createdAt: moment(item.createdAt).format('LLL'),
                            updatedAt: moment(item.updatedAt).format('LLL'),
                        }
                    })
            })
            let data = await Promise.all(promise).
            then((values) => {
                return values;
            })

            res.render("todo/index", {
                title: "Обьявления",
                todo: {
                    data: data,
                    status: "ok",
                },
                user: req.user,
                search: search
            });
        } else {
            userLogout(req, res, next, message);
        }

    } catch (e) {
        console.log(e);
        res.status(500).json(e)
    }
})

module.exports = router