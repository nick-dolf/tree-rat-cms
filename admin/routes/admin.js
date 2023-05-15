const express = require("express");
const router = express.Router();
const fse = require("fs-extra");
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
          const user = req.body.email;
          const pass = req.body.password;

          fse.appendFileSync(
            ".env",
            `\nADMIN_USER="${user}"\nADMIN_PASS="${pass}"`
          );
          process.exit();
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

/*
 * Login User
 */
router.get("/login", (req, res) => {
  res.render("admin/login", { page: { info: "Welcome Back!" } });
});

router.post(
  "/login",
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password").trim().escape(),
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      if (
        req.body.email === adminUser.name &&
        req.body.password === adminUser.password
      ) {
        req.session.loggedin = true;
        res.redirect(req.app.locals.site.url + "admin/");
      } else {
        res.render("admin/login", { page: { info: "Invalid credentials" } });
      }
    } else {
      res.render("admin/login", { page: { info: "Invalid credentials" } });
    }
  }
);

router.use((req, res, next) => {
  if (req.session.loggedin) {
    next();
  } else {
    req.session.original = req.url;
    res.redirect(req.app.locals.site.url + "admin/login");
  }
});

router.get("/", (req, res) => {
  res.send("dashboard!!!");
});

module.exports = router;
