const fse = require("fs-extra");
const path = require("path");
const express = require("express");
const app = require("../../treerat");
const { PurgeCSS } = require("purgecss");
const sass = require("sass");
const JsonDb = require("./jsonDb")

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
  fse.ensureDirSync(app.locals.siteDir + "/assets/images");
  fse.ensureDirSync(app.locals.pageDir);
  fse.ensureDirSync(app.locals.pageDir + "/drafts");
  fse.ensureDirSync(app.locals.pageDir + "/published");
  fse.ensureDirSync(app.locals.viewDir);
  fse.ensureDirSync(app.locals.imgDir);

  // Site variables
  app.locals.site = {};
  app.locals.site.url = config.developmentUrl;

  app.locals.pages = new JsonDb("pages", "link");
  app.locals.site.pages = app.locals.pages.data;

  app.locals.folders = new JsonDb("folders", "slug")
  app.locals.site.folders = app.locals.folders.data;

  app.locals.blocks = new JsonDb("blocks", "slug");
  app.locals.site.blocks = app.locals.blocks.data;

  app.locals.sections = new JsonDb("sections", "slug");
  app.locals.site.sections = app.locals.sections.data;

  try {
    app.locals.site.images = fse.readJsonSync(app.locals.imgDir + "/info.json");
  } catch (err) {
    app.locals.site.images = [];
    console.error(err.message);
  }

  // Make Sure Home Page exists
  app.locals.pages.add({
    name: "Home",
    slug: "home",
    folder: "",
    link: "home",
    publishedDate: false,
    draftedDate: new Date().toString(),
  })
  try {
    fse.statSync(pageDir + "drafts/home.json");
  } catch {
    fse.writeJsonSync(pageDir + "drafts/home.json", {
      title: "",
      description:""
    });
  }


  // build admin script
  let out = "";
  fse
    .readdir("admin/browser")
    .then((files) => {
      for (file of files) {
        let contents = fse.readFileSync("admin/browser/" + file);
        out += contents.toString() + "\n";
      }
    })
    .then(() => {
      fse.outputFile("admin/assets/script.js", out);
    });

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
  // Block Imports
  let blockImport = "";
  for (block of app.locals.site.blocks) {
    blockImport += `@import "${block.slug}/style-${block.slug}";\n`;
  }

  fse.outputFileSync(app.locals.viewDir + "/blocks/blocks.scss", blockImport);

  // Section Imports
  let sectionImport = "";
  for (section of app.locals.site.sections) {
    sectionImport += `@import "${section.slug}/style-${section.slug}";\n`;
  }

  fse.outputFileSync(app.locals.viewDir + "/sections/sections.scss", sectionImport);

  /**
   * SASS
   */
  const sassResult = sass.compile(app.locals.viewDir + "/main.scss", {
    style: "compressed",
  });

  fse.outputFileSync(app.locals.siteDir + "/assets/style.css", sassResult.css);

  /** 
   * Copy Assets
   */
  fse.copy("assets", "site/assets").catch((err) => {
    console.error(err);
  });

  /**
   * Publish Pages
   */
  for (page of app.locals.site.pages) {
    if (page.publishedDate) {
      const data = fse.readJsonSync(app.locals.pageDir + "/published/" + page.link + ".json")

      app.locals.publishPage('default', {...data, ...page})
    }
  }

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
