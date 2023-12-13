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

    const result = app.locals.folders.add({slug: slug, name: req.body.name})

    if (result == -1) {
      return res.status(409).send("folder already exists");
    }

    fse
      .mkdir(draftDir + slug)
      .then(() => {
        res.adminRender("sections/page-accordion", {changedFolder: slug});
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
);

router.delete("/:slug", (req, res) => {
  const slug = req.params.slug;

  const result = app.locals.folders.deleteById(slug);

  if (result != -1) {
    fse
      .remove(draftDir + slug)
      .then(() => {
        res.adminRender("sections/page-accordion", {changedFolder: slug});
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    res.status(400).send("unable to delete folder");
  }
});

module.exports = router;
