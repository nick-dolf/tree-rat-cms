const sharp = require("sharp");
const fse = require("fs-extra");
const path = require("path");

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

module.exports = { processUploadImg }