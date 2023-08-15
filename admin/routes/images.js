// Imports
const app = require("../../treerat");
const fse = require("fs-extra");
const express = require("express");
const sharp = require("sharp");
const path = require("path");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { processUploadImg } = require("../utils/imgProc");
const slugify = require("slugify");
const multer = require("multer");
// Variables
const imgDir = app.locals.imgDir;
const imgOgDir = imgDir + "/original";
fse.ensureDirSync(imgOgDir);


// IMAGE STORAGE WITH MULTER
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imgOgDir);
  },
  filename: function (req, file, callback) {
    callback(null, niceImageName(file.originalname));
  },
});
var upload = multer({ storage: storage });



/*
/ Read (GET)
*/
router.get("/*", (req, res) => {
  res.adminRender("images");
});

/*
/ Create (POST)
*/
router.post("/", upload.array("pic"), (req, res) => {
  let newImages = []
  Promise.all(
    req.files.map(async (file) => {
      const metadata = await sharp(file.path).metadata();

      const imageData = {
        name: file.filename,
        uploadEpochTime: Date.now(),
        modifiedEpochTime: "",
        generatedEpochTime: "",
        height: metadata.height,
        width: metadata.width,
        og: { height: metadata.height, width: metadata.width },
      };
      app.locals.images.add(imageData);
      newImages.unshift(imageData);

      await processUploadImg(file.filename, imgOgDir);
    })
  )
    .then(() => {
      res.adminRender('layouts/image-gallery-new', {images: newImages});
    })
    .catch((err) => {
      console.error(err);
    });
});

/*
 * Update (Put)
 */
router.put("/*", upload.none(),(req, res) => {
  const slug = req.url.slice(1);

  let image = app.locals.images.findById(slug)

  if(!image) {
    return res.status(400).send("image not found")
  }

  image.alt = req.body.alt
  app.locals.images.update(image)

  res.send(slug)
})

/*
 * Delete (DELETE)
 */
router.delete("/*", (req, res) => {
  const slug = req.url.slice(1);

  const result = app.locals.images.deleteById(slug)

  if (result != -1) {
    fse.rm(imgOgDir+req.url)
      .then(() => {
        return fse.rm(imgOgDir+"/thumb"+req.url)
      })
      .then(() => {
        res.send("image deleted")
      })
      .catch((err) => {
        console.error(err)
        res.status(400).send(err.message)
      })
  } else {
    res.status(400).send("unable to delete file")
  }

});

function niceImageName(imageFile) {
  const pathObject = path.parse(imageFile);

  let name = slugify(pathObject.name, {
    remove: /[*+~.()'"!/:@]/g,
    lower: true,
  });

  if (app.locals.site.images[imageFile]) {
    name += "-copy";
  }

  return name + pathObject.ext;
}


module.exports = router;
