const app = require("../../treerat");
const path = require("path");
const fse = require("fs-extra");
const express = require("express");
const router = express.Router();
/*
/ Important variables
*/
const sectionDir = app.locals.viewDir + "/sections/";
fse.ensureDirSync(sectionDir);

/*
/ Create (Post)
*/
router.post("/*", (req, res) => {
  const slug = req.body.slug;
  const result = app.locals.sections.add(req.body);

  if (result != -1) {
    fse
      .mkdir(sectionDir + slug)
      .then(() => {
        return fse.outputFile(`${sectionDir}${slug}/admin-${slug}.ejs`, "")
      })
      .then(() => {
        return fse.outputFile(`${sectionDir}${slug}/site-${slug}.ejs`, "")
      })
      .then(() => {
        return fse.outputFile(`${sectionDir}${slug}/style-${slug}.scss`, "")
      })
      .then(() => {
        res.adminRender("layouts/dev-sections");
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    res.status(400).send("unable to create section");
  }
});

/**
 * Delete
 */
router.delete("/:slug", (req, res) => {
  const slug = req.params.slug;

  const result = app.locals.sections.deleteBySlug(slug);

  if (result != -1) {
    fse
      .remove(sectionDir + slug)
      .then(() => {
        res.adminRender("layouts/dev-sections");
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    res.status(400).send("unable to delete section");
  }
});

module.exports = router;
