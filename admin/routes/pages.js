const app = require("../../treerat");
const fse = require("fs-extra");
const express = require("express");
const path = require("path");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");

const draftDir = app.locals.pageDir + "/drafts/";

router.get("/", (req, res) => {
  res.adminRender("pages");
});

router.post("*", body("name").isString().isLength({ min: 2 }).trim(), (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array()[0].msg);
  }

  const slug = slugify(req.body.name, {
    remove: /[*+~.()'"!/:@]/g,
    lower: true,
  });

  const folder = slugify(req.body.folder, {
    remove: /[*+~.()'"!/:@]/g,
    lower: true,
  });

  if (
    req.app.locals.site.pages.some((item) => {
      return item.folder === folder && item.slug === slug;
    })
  ) {
    return res.status(403).send("Page with that name already exists");
  }

  const pageData = {
    name: req.body.name,
    slug: slug,
    folder: folder,
    permalink: path.join(folder, slug),
    publishedDate: false,
    draftedDate: new Date().toString(),
    details: {},
  };

  // Get Pages
  router.get("/*", (req, res) => {
    const page = req.url

    res.send(page)

  })

  // Update pages
  req.app.locals.site.pages.push(pageData);

  // Save Page Data to JSON
  const filePath = path.join(draftDir, folder, slug);
  fse
    .outputJson(`${filePath}.json`, pageData)
    .then(() => {
      res.adminRender("layouts/page-accordion");
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).end();
    });
});

router.delete("/*", (req, res) => {
  const slug = req.url.slice(1);

  console.log(slug)
  const result = app.locals.site.pages.findIndex((page) => {
    return (page.permalink == slug);
  });

  console.log(result)
  if (!result) {
    return res.status(404).send("page not found")
  }

  app.locals.site.pages.splice(result, 1)

  const filePath = path.join(draftDir, slug) +".json";
  console.log(filePath)
  fse
    .rm(filePath)
    .then(() => {
      res.adminRender("layouts/page-accordion");
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).end();
    });
});

module.exports = router;
