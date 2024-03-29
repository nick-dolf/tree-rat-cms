const sharp = require("sharp");
const fse = require("fs-extra");
const path = require("path");
const app = require("../../treerat");

async function processUploadImg(img, srcDir) {
  await fse.mkdirs(srcDir + "/thumb");

  await sharp(srcDir + "/" + img)
    .resize({
      width: 200,
      height: 200,
      fit: "contain",
      background: "#FFF",
    })
    .toFile(srcDir + "/thumb/" + img);
}

function publishImg(img, options, promises) {
  let image = app.locals.images.findById(img)

  if(!image) return "";

  let imgName = path.parse(image.name).name + `-${image.uploadEpochTime}`;

  let promise = convertImages(image, imgName, options)

  if(promises) {
    promises.push(promise)
  }

  return imgName;
}

async function convertImages(image, imgName, options) {
  let siteImgDir = path.join(app.locals.siteDir, "assets/images/");
  let imgDir = path.join(app.locals.imgDir, "original");

  // Produce fallback jpg
  if(!fse.existsSync(siteImgDir + imgName + "-" + options.width + ".jpg")) {
    await sharp(`${imgDir}/${image.name}`)
      .resize({
        width: options.width,
        fit: "contain",
        background: "#FFF",
      })
      .jpeg()
      .toFile(siteImgDir + imgName + "-" + options.width + ".jpg");
  };

  // Produce WebP in different Widths
  for (width of options.widths) {
    const fname = `${siteImgDir}${imgName}-${width}.webp`
    const imgWidth = width

    if(!fse.existsSync(fname)) {
      await sharp(`${imgDir}/${image.name}`).resize({ width: imgWidth }).webp().toFile(fname);
    }
  }
}

module.exports = { processUploadImg, publishImg };
