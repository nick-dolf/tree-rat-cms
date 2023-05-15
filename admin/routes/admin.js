const express = require("express");
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
const cookieSession = require("cookie-session");
const { body, validationResult } = require("express-validator");

router.use("/assets", express.static("admin/assets"));

router.use(
  cookieSession({
    name: "session",
    keys: ["secret1", "secret2"],
    maxAge: 1 * 60 * 1000,
  })
);

const adminUser = {
  name: process.env.ADMIN_USER,
  password: process.env.ADMIN_PASS,
};

/*
 * Create Admin user on first start up
 */
router.get("/register", (req, res) => {
  if (adminUser.name) {
    res.redirect(req.app.locals.site.url + "admin/login");
  } else {
    res.render("admin/register", { page: { info: "" } });
  }
});

router.post(
  "/register",
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password")
    .isStrongPassword()
    .trim()
    .escape()
    .withMessage("Password is too weak."),
  body("confirmPassword").trim().escape(),
  (req, res) => {
    if (adminUser.name) {
      res.redirect(req.app.locals.site.url + "admin/login");
    } else {
      const errors = validationResult(req);

      if (errors.isEmpty()) {
        if (req.body.password === req.body.confirmPassword) {
          res.render("admin/register", { page: { info: "Success" } });
        } else {
          res.render("admin/register", {
            page: { info: "Passwords do not match" },
          });
        }
      } else {
        res.render("admin/register", { page: { info: errors.array()[0].msg } });
      }
    }
  }
);

router.use((req, res, next) => {
  if (adminUser.name) {
    next();
  } else {
    res.redirect(req.app.locals.site.url + "admin/register");
  }
});

router.get("/login", (req, res) => {
  if (process.env.adminName) {
    res.render("admin/login", { page: { info: "" } });
  } else {
    res.render("admin/login", {
      page: { info: "Create Admin user", init: true },
    });
  }
});

router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Invalid password"),
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      res.render("admin/login", { page: { info: "Congrats" } });
    } else {
      res.render("admin/login", { page: { info: errors.array()[0].msg } });
    }
  }
);

module.exports = router;
