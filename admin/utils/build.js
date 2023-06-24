const fse = require("fs-extra");
const path = require("path");
const express = require("express");
const app = require("../../treerat");
const { PurgeCSS } = require("purgecss");
const sass = require("sass");

const pageDir = path.join(process.cwd(), "pages/");
const draftDir = pageDir + "drafts/";
const sectionDir = path.join(process.cwd(), "views/sections");

function setup(file) {
  // Read Site Configuration
  const config = fse.readJsonSync(file);
  app.locals.siteDir = path.join(process.cwd(), config.siteDirectory);
  app.locals.pageDir = path.join(process.cwd(), config.pageDirectory);
  app.locals.viewDir = path.join(process.cwd(), config.viewDirectory);
  app.locals.imgDir = path.join(process.cwd(), config.imageDirectory);

  // Remove previous site build
  fse.removeSync(app.locals.siteDir);

  // Ensure needed directories exist
  fse.ensureDirSync(app.locals.siteDir);
  fse.ensureDirSync(app.locals.pageDir);
  fse.ensureDirSync(app.locals.pageDir + "/drafts");
  fse.ensureDirSync(app.locals.pageDir + "/published");
  fse.ensureDirSync(app.locals.viewDir);
  fse.ensureDirSync(app.locals.imgDir);

  // Ensure needed files exist
  try {
    fse.statSync(pageDir + "drafts/home.json");
  } catch {
    fse.writeJsonSync(pageDir + "drafts/home.json", {
      name: "Home",
      slug: "home",
      folder: "",
      permalink: "home",
      publishedDate: false,
      draftedDate: new Date().toString(),
    });
  }

  // Site variables
  app.locals.site = {};
  app.locals.site.url = config.developmentUrl;

  app.locals.site.folders = fse
    .readdirSync(pageDir + "drafts", { withFileTypes: true })
    .filter((entry) => {
      return entry.isDirectory();
    })
    .map((dirent) => dirent.name);

  app.locals.site.pages = getPageDetails(draftDir).flat();

  app.locals.site.sections = fse.readdirSync(sectionDir);

  try {
    app.locals.site.images = fse.readJsonSync(app.locals.imgDir + "/info.json");
  } catch (err) {
    app.locals.site.images = [];
    console.error(err.message);
  }
  console.log(app.locals.site.images.length)

  // build custom admin stylesheet
  const sassResult = sass.compile("admin/views/style.scss", {
    style: "compressed",
  });

  fse.outputFileSync("admin/assets/style.css", sassResult.css);
}

function getPageDetails(dir) {
  return fse.readdirSync(dir, { withFileTypes: true }).map((dirent) => {
    if (dirent.isDirectory()) {
      return getPageDetails(draftDir + dirent.name + "/");
    } else {
      return fse.readJsonSync(dir + dirent.name);
    }
  });
}

function buildSite() {
  // build custom admin stylesheet
  const sassResult = sass.compile(app.locals.viewDir + "/main.scss", {
    style: "compressed",
  });

  fse.outputFileSync(app.locals.siteDir + "/assets/style.css", sassResult.css);

  /*
   * Copy Assets
   */
  fse.copy("assets", "site/assets").catch((err) => {
    console.error(err);
  });
}

module.exports = { setup, buildSite };

// app.locals.site.folders = fse.readdirSync(pageDir + "drafts", {withFileTypes: true }).map((entry) => {
//   const pageEntry = fse.readJsonSync(pageDir + "drafts/" + entry);
//   return {
//     name: pageEntry.name,
//     slug: pageEntry.slug,
//     permalink: pageEntry.permalink,
//     publishedDate: pageEntry.publishedDate,
//     draftedDate: pageEntry.draftedDate,
//   };
// });

// // Remove unneeded CSS from Bootstrap
// const purgeCSSResult = await new PurgeCSS().purge({
//   content: ["admin/views/admin/**/*.ejs"],
//   css: ["admin/assets/bootstrap.css"],
// });

// fse.outputFileSync(
//   "admin/assets/bootstrap.purged.css",
//   purgeCSSResult[0].css
// );
