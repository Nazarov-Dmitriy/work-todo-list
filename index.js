const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');
const toDoRouter = require('./src/routes/todoRouter')
const userRouter = require('./src/routes/userRouter')
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const UrlDB = process.env.ME_CONFIG_MONGODB_URL
const DATABESE = process.env.ME_CONFIG_MONGODB_DATABASEE
const COOKIE_SECRET = process.env.COOKIE_SECRET
const PORT = process.env.PORT || 7070

mongoose.Promise = global.Promise;

const app = express()

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());
app.set('view engine', 'ejs')
app.use(session({
    secret: COOKIE_SECRET,
}));
app.use(cookieParser());
app.use(passport.initialize())
app.use(passport.session())

app.use('/', toDoRouter)
app.use('/', userRouter)


app.listen(PORT, async () => {
    try {
        console.log(`Server listener  on port ${PORT}`);
        await mongoose.connect(UrlDB, {
            dbName: DATABESE
        }).then(() => {
            console.log('Database connected')
        }, error => {
            console.log('Database cant be connected: ' + error)
        })

    } catch (e) {
        console.log(e);
    }
});