//jshint esversion:6

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const app = express()
const passport = require('passport')
const session = require('express-session')
const passportLocalMongoose = require('passport-local-mongoose')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    secret: 'My very own secret.',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://admin-shawn:passmore@cluster0.hqjap.mongodb.net/userDB', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('useCreateIndex', true)

const userSchema = new mongoose.Schema({
    email: String, 
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model('User', userSchema)

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/secrets');
            })
        }
    })
        
})

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, err => {
        if(err) {
            console.log(err)
        } else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/secrets');
            })
        }
    })
})

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/secrets', (req, res) => {
    if(req.isAuthenticated()) {
        res.render('secrets')
    } else {
        res.redirect('/login')
    }
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.listen(3000, () => {
    console.log('Listening on port 3000');
})