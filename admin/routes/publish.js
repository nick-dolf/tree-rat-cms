const app = require("../../treerat");
const fse = require("fs-extra");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");

const draftDir = app.locals.pageDir + "/drafts/";
const publishDir = app.locals.pageDir + "/published/";

router.post("/*", (req, res) => {
  const link = req.url.slice(1)

  let page = app.locals.pages.findById(link)
  page.publishedDate = new Date().toString()
  app.locals.pages.update(page)

  fse.copy(draftDir+link+".json", publishDir+link+".json")
    .then(() => {
      return fse.readJson(publishDir+link+".json")
    })
    .then((data) => {
      app.locals.publishPage('default', {...data, ...page})
      res.adminRender('layouts/page-control', page)
    })
    .catch(err => {
      console.error(err.message)
      res.status(500).end();
    })

})

module.exports = router;