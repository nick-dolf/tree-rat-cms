const app = require("../../treerat");
const path = require("path");
const fse = require("fs-extra");
const express = require("express");
const router = express.Router();

/*
/ Important variables
*/
const draftDir = app.locals.pageDir + "/drafts/";

/*
/ Read (GET)
*/
router.get("/*", (req, res) => {
  const page = path.join(draftDir, req.url);
  console.log(page);

  fse
    .readJson(page + ".json")
    .then((data) => {
      let template = "default";
      if (data.template) template = data.template;

      res.siteRender(`default`, data);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(404).end("page does not exist");
    });
});

module.exports = router;
