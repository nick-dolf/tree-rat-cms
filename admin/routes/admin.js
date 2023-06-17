const express = require("express");
const router = express.Router();
const fse = require("fs-extra");
const cookieSession = require("cookie-session");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const hashpass = require("../utils/hashpass");

router.use(express.urlencoded({ extended: true }));
router.use("/assets", express.static("admin/assets"));

let secret1, secret2;

if (process.env.SECRET_KEY_1) {
  secret1 = process.env.SECRET_KEY_1;
  secret2 = process.env.SECRET_KEY_2;
} else {
  secret1 = crypto.randomUUID();
  secret2 = crypto.randomUUID();
  fse.appendFileSync(
    ".env",
    `\nSECRET_KEY_1="${secret1}"\nSECRET_KEY_2="${secret2}"`
  );
}

router.use(
  cookieSession({
    name: "session",
    keys: [secret1, secret2],
    maxAge: 24 * 60 * 60 * 1000,
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
    res.adminRender("register", { page: { info: "" } });
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

          hashpass
            .hash(req.body.password)
            .then((key) => {
              console.log(key)
              fse.appendFileSync(
                ".env",
                `\nADMIN_USER="${user}"\nADMIN_PASS="${key}"`
              );
              process.exit();
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          res.adminRegister("register", {
            page: { info: "Passwords do not match" },
          });
        }
      } else {
        res.adminRegister("register", { page: { info: errors.array()[0].msg } });
      }
    }
  }
);

router.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    next();
  } else if (adminUser.name)  {
    next();
  } else {
    res.redirect(req.app.locals.site.url + "admin/register");
  }
});

/*
 * Login User
 */
router.get("/login", (req, res) => {
  res.adminRender("login", { page: { info: "Welcome Back!" } });
});

router.post(
  "/login",
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password").trim().escape(),
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      if (req.body.email === adminUser.name) {
        hashpass
          .compare(req.body.password, adminUser.password)
          .then((result) => {
            if (result) {
              req.session.loggedin = true;
              res.redirect(req.app.locals.site.url + "admin/pages");
            } else {
              res.adminRender("login", {
                page: { info: "Invalid credentials" },
              });
            }
          });
      } else {
        res.adminRender("login", { page: { info: "Invalid credentials" } });
      }
    } else {
      res.adminRender("login", { page: { info: "Invalid credentials" } });
    }
  }
);

router.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    next();
  } else if (req.session.loggedin) {
    next();
  } else {
    req.session.original = req.url;
    res.redirect(req.app.locals.site.url + "admin/login");
  }
});

router.get("/", (req, res) => {
  res.send("dashboard!!!");
});

// routes
router.use("/pages", require("./pages"));
router.use("/page-folders", require("./page-folders"));
router.use("/assets", require("./assets"));

module.exports = router;
