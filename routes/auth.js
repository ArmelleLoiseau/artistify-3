const router = require("express").Router()
const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")

const saltRounds = 10

const User = require("../model/User")

router.get("/signin", (req, res) => {
    res.render("auth/signin.hbs")
})

router.get("/signup", (req, res) => {
    res.render("auth/signup.hbs")
})

router.post("/signup", (req, res) => {
    const newUser = { ...req.body }

    if (!newUser.username || !newUser.email || !newUser.password) {
        req.flash("error", "Please fill in all the fields")
        res.redirect("/auth/signup")
    }

    bcryptjs
        .genSalt(saltRounds)
        .then((salt) => bcryptjs.hash(newUser.password, salt))
        .then((hashedPassword) => {
            const hashedPw = hashedPassword
            User.findOne({ email: newUser.email })
                .then((email) => {
                    if (email) {
                        req.flash("warning", "This e-mail already exists in our database, asshole!")
                        res.redirect("/auth/signup")               
                    } else {
                        console.log(hashedPassword)
                        User
                            .create({
                                email: newUser.email,
                                username: newUser.username,
                                password: hashedPw
                            })
                            .then(() => {
                                req.flash("success", "All good! BItch")
                                res.redirect("/auth/signin")
                            })
                            .catch(err => console.error(err))
                    }
                })
                .catch(err => console.error(err))
                })
})

module.exports = router