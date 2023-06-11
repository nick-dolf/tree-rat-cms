const app = require("../../treerat");
const fse = require("fs-extra");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");

const draftDir = app.locals.pageDir + "/drafts/";

router.post(
  "*",
  body("name").isString().isLength({ min: 2 }).trim(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array()[0].msg);
    }

    const slug = slugify(req.body.name, {
      remove: /[*+~.()'"!/:@]/g,
      lower: true,
    });

    if (app.locals.site.folders.includes(slug)) {
      return res.status(409).send("folder already exists");
    }

    app.locals.site.folders.push(slug);
    app.locals.site.folders.sort();

    fse
      .mkdir(draftDir + slug)
      .then(() => {
        res.render("admin/layouts/page-accordion");
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
);

router.delete("/:folder", (req, res) => {
  const slug = req.params.folder;

  if (!app.locals.site.folders.includes(slug)) {
    return res.status(409).send("folder does not exist");
  }

  app.locals.site.folders = app.locals.site.folders.filter((folder) => {
    return folder != slug;
  });
  console.log(app.locals.site.folders);

  fse
    .rmdir(draftDir + slug)
    .then(() => {
      res.render("admin/layouts/page-accordion");
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

module.exports = router;
