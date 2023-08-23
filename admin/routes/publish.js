const app = require("../../treerat");
const fse = require("fs-extra");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");

const draftDir = app.locals.pageDir + "/drafts/";
const publishDir = app.locals.pageDir + "/published/";

router.post("/*", (req, res) => {
  const link = req.url.slice(1);

  let page = app.locals.pages.findById(link);
  page.publishedDate = new Date().toString();
  app.locals.pages.update(page);

  fse
    .copy(draftDir + link + ".json", publishDir + link + ".json")
    .then(() => {
      return fse.readJson(publishDir + link + ".json");
    })
    .then((data) => {
      app.locals.publishPage("default", { ...data, ...page });
      res.adminRender("layouts/page-control-publish", page);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).end();
    });
});

router.delete("/*", (req, res) => {
  const link = req.url.slice(1);

  if (link == "home") {
    return res.status(400).send("cannot recall home page")
  }

  let page = app.locals.pages.findById(link);
  if (!page) {
    return res.status(404).send("page not found");
  }

  page.publishedDate = "";
  const result = app.locals.pages.update(page);

  if (result == -1) {
    return res.status(500).send("unable to update page")
  }

  fse.rm(publishDir + link + ".json")
    .then(() => {
      return fse.rm(app.locals.siteDir + "/" + link + "/index.html")
    })
    .then(() => {
      res.adminRender("layouts/page-control-publish", page);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).end();
    });

});

module.exports = router;
