const app = require("../../treerat");
const express = require("express");
const router = express.Router();
const fse = require("fs-extra");
const path = require("path");
const slugify = require("slugify");
const multer = require("multer");

// Variables
const fileDir = app.locals.fileDir;

// File STORAGE WITH MULTER
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileDir);
  },
  filename: function (req, file, callback) {
    callback(null, niceFileName(file.originalname));
  },
});
var upload = multer({ storage: storage });

/*
/ Read (GET)
*/
router.get("/*", (req, res) => {
  res.adminRender("files");
});

/*
/ Create (POST)
*/
router.post("/", upload.array("file"), (req, res) => {
  let newFiles = []
  Promise.all(
    req.files.map(async (file) => {

      const fileData = {
        name: file.filename,
        uploadEpochTime: Date.now(),
      };
      app.locals.files.add(fileData);
      newFiles.unshift(fileData);
    })
  )
    .then(() => {
      res.adminRender('layouts/file-gallery-new', {files: newFiles});
    })
    .catch((err) => {
      console.error(err);
    });
});

/*
 * Delete (DELETE)
 */
router.delete("/*", (req, res) => {
  const slug = req.url.slice(1);

  const result = app.locals.files.deleteById(slug)

  if (result != -1) {
    fse.rm(fileDir+req.url)
      .then(() => {
        res.send("file deleted")
      })
      .catch((err) => {
        console.error(err)
        res.status(400).send(err.message)
      })
  } else {
    res.status(400).send("unable to delete file")
  }

});

function niceFileName(file) {
  const pathObject = path.parse(file);

  let name = slugify(pathObject.name, {
    remove: /[*+~.()'"!/:@]/g,
    lower: true,
  });

  if (app.locals.site.files[file]) {
    name += "-copy";
  }

  return name + pathObject.ext;
}

module.exports = router;