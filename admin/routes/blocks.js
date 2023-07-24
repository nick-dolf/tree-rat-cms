const app = require("../../treerat");
const path = require("path");
const fse = require("fs-extra");
const express = require("express");
const router = express.Router();
/*
/ Important variables
*/
const blockDir = app.locals.viewDir + "/blocks/";
fse.ensureDirSync(blockDir);

/*
/ Create (Post)
*/
router.post("/*", (req, res) => {
  const slug = req.body.slug;
  const result = app.locals.blocks.add(req.body);

  if (result != -1) {
    fse
      .mkdir(blockDir + slug)
      .then(() => {
        return fse.outputFile(`${blockDir}${slug}/admin-${slug}.ejs`, "")
      })
      .then(() => {
        return fse.outputFile(`${blockDir}${slug}/site-${slug}.ejs`, "")
      })
      .then(() => {
        return fse.outputFile(`${blockDir}${slug}/style-${slug}.scss`, "")
      })
      .then(() => {
        res.adminRender("layouts/dev-blocks");
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    res.status(400).send("unable to create block");
  }
});

/**
 * Delete
 */
router.delete("/:slug", (req, res) => {
  const slug = req.params.slug;

  const result = app.locals.blocks.deleteBySlug(slug);

  if (result != -1) {
    fse
      .remove(blockDir + slug)
      .then(() => {
        res.adminRender("layouts/dev-blocks");
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    res.status(400).send("unable to delete block");
  }
});

module.exports = router;
