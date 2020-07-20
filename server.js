const express = require('express')
const session = require('express-session')

const { db, Users } = require('./db')

const app = express()

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '24knb6k247b2k7b2k7bk247hb2kh7b2',
}))



app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/logout', (req, res) => {
    req.session.userId = null
    res.redirect('login')
})


app.get('/profile', async(req, res) => {
    // idhar vo user ki details bhejni h jise login kiya h ->cookie kaam kregi ye (uper session wali line ki mada se)
    if (!req.session.userId) {
        return res.redirect('/login')
    }
    const user = await Users.findByPk(req.session.userId)
    res.render('profile', { user })
})

app.post('/login', async(req, res) => {
    const user = await Users.findOne({ where: { username: req.body.username } })
    if (!user) {
        return res.status(404).render('login', { error: 'No such username found' })
    } else {
        if (user.password == req.body.password) {
            req.session.userId = user.id //ye imp h line isse hi hmara profile page m render hoga data login user ki detail
            res.redirect('/profile')
        } else {
            return res.status(401).render('login', { error: 'Wrong Password' })

        }
    }
})

app.post('/signup', async(req, res) => {
    const user = await Users.create({
        username: req.body.username,
        password: req.body.password, // NOTE: in production we save hash of password
        email: req.body.email
    })

    res.status(201).send(`User ${user.id} created`)
})

db.sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server has started')
        })
    })
    .catch(console.error)