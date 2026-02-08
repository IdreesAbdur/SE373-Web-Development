import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// show register
router.get("/register", (req, res) => {
  res.render("register", { error: req.flash("error") });
});

// handle register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      req.flash("error", "all fields are required");
      return res.redirect("/register");
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      req.flash("error", "username or email already exists");
      return res.redirect("/register");
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashed });

    return res.redirect("/login");
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "server error during registration" });
  }
});

// show login
router.get("/login", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

// handle login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// protected page
router.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

export default router;
