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
  app.locals.siteDir = path.join(process.cwd(), "site/");
  app.locals.pageDir = path.join(process.cwd(), "pages/");
  app.locals.viewDir = config.viewDirectory;

  // Remove previous site build
  fse.removeSync(app.locals.siteDir);

  // Ensure needed directories exist
  fse.ensureDirSync(app.locals.siteDir);
  fse.ensureDirSync(pageDir);
  fse.ensureDirSync(pageDir + "drafts");
  fse.ensureDirSync(pageDir + "published");
  fse.ensureDirSync(`${process.cwd()}/${app.locals.viewDir}`);

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

  console.log(app.locals.site.sections);

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

  fse.outputFileSync(app.locals.siteDir + "assets/style.css", sassResult.css);

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
