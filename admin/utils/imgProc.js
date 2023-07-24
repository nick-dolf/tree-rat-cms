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
  let image = app.locals.site.images.find((e) => e.name == img);

  let imgName = path.parse(image.name).name + `-${image.uploadEpochTime}`;

  let promise = convertImages(image, imgName, options)

  // let promise = new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve("foo");
  //   }, 500);
  // });
  if(promises) {
    promises.push(promise)
  }

  return imgName;
}

async function convertImages(image, imgName, options) {
  let siteImgDir = path.join(app.locals.siteDir, "assets/images/");
  let imgDir = path.join(app.locals.imgDir, "original");

  const imageBuff = await sharp(`${imgDir}/${image.name}`).toBuffer()

  // Produce fallback jpg
  if(!fse.existsSync(siteImgDir + imgName + ".jpg")) {
    await sharp(imageBuff)
      .resize({
        width: options.width,
        height: options.height,
        fit: "contain",
        background: "#FFF",
      })
      .jpeg()
      .toFile(siteImgDir + imgName + ".jpg");
  };

  // Produce WebP in different Widths
  for (width of options.widths) {
    const fname = `${siteImgDir}${imgName}-${width}.webp`
    const imgWidth = width

    if(!fse.existsSync(fname)) {
      await sharp(imageBuff).resize({ width: imgWidth }).webp().toFile(fname);
    }
  }
}

module.exports = { processUploadImg, publishImg };
