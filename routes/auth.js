const router = require("express").Router();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const User = require("../model/User");

const protectRoute = require("./../middlewares/protectRoute");
const protectUnlogged = require("./../middlewares/protectUnlogged");

router.get("/signout", protectRoute, (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/auth/signin");
  });
});

router.get("/signin", protectUnlogged, (req, res) => {
  res.render("auth/signin.hbs");
});

router.get("/signup", protectUnlogged, async (req, res, next) => {
  try {
    const role = ["admin", "user"];
    res.render("auth/signup.hbs", {
      role,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/signup", async (req, res, next) => {
  const newUser = { ...req.body };

  if (!newUser.username || !newUser.email || !newUser.password) {
    req.flash("error", "Please fill in all the fields");
    res.redirect("/auth/signup");
  }

  try {
    const hashedPassword = await bcrypt.hashSync(newUser.password, saltRounds);

    const hashedPw = hashedPassword;
    User.findOne({ email: newUser.email }).then((email) => {
      if (email) {
        req.flash(
          "warning",
          "This e-mail already exists in our database, asshole!"
        );
        res.redirect("/auth/signup");
      } else {
        console.log(hashedPassword);
        User.create({
          email: newUser.email,
          username: newUser.username,
          password: hashedPw,
          role: newUser.role,
        })
          .then(() => {
            req.flash("success", "All good! BItch");
            res.redirect("/auth/signin");
          })
          .catch((err) => console.error(err));
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post("/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      req.flash("error", "User not found.");
      res.redirect("/auth/signin");
    } else {
      const isSamePassword = bcrypt.compareSync(password, foundUser.password);
      console.log(isSamePassword, req.body, foundUser);
      if (!isSamePassword) {
        req.flash("error", "Wrong password.");
        res.redirect("/auth/signin");
      } else {
        const userObject = foundUser.toObject();
        delete userObject.password;
        req.session.currentUser = userObject;
        console.log(`User object is : ${userObject}`);
        console.log(`req.Session is : ${req.session}`);
        req.flash("success", "Successfully logged in !");
        res.redirect("/dashboard");
      }
    }
  } catch (e) {
    next(e);
  }
});
module.exports = router;
