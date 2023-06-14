// Imports
const app = require("../../treerat");
const fse = require("fs-extra");
const express = require("express");
const path = require("path");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
const upload = require("multer")();
// Variables
const draftDir = app.locals.pageDir + "/drafts/";

/*
/ Create (POST)
*/
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

/*
/ Read (GET)
*/
router.get("/", (req, res) => {
  res.adminRender("pages");
});

router.get("/*", (req, res) => {
  const page = path.join(draftDir, req.url);

  fse
    .readJson(page + ".json")
    .then((data) => {
      res.adminRender("pageEdit", data);
    })
    .catch((err) => {
      res.status(404).end("page does not exist");
    });
});

/*
/ Update (PUT)
*/
router.put("/*", upload.none(), (req, res) => {
  const link = req.url.slice(1)
  const pageFile = path.join(draftDir, link)+".json";
  console.log(link, pageFile)

  // Update pages
  let pageInfo = {};
  req.app.locals.site.pages = req.app.locals.site.pages.filter((item) => {
    if (item.permalink == link) {
      item.draftedDate = new Date().toString();
      pageInfo = item;
    }
    return item;
  });
  const pageData = { ...pageInfo, ...req.body };
  console.log(pageData)

  // Save Page Data to JSON
  fse
    .outputJson(pageFile, pageData)
    .then(() => {
      res.adminRender("layouts/page-form", pageData );
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).end();
    });
});


router.delete("/*", (req, res) => {
  const slug = req.url.slice(1);

  console.log(slug);
  const result = app.locals.site.pages.findIndex((page) => {
    return page.permalink == slug;
  });

  console.log(result);
  if (!result) {
    return res.status(404).send("page not found");
  }

  app.locals.site.pages.splice(result, 1);

  const filePath = path.join(draftDir, slug) + ".json";
  console.log(filePath);
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
