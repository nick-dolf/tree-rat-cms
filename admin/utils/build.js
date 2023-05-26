const fse = require("fs-extra");
const path = require("path");
const express = require("express");
const app = require("../../treerat");
const { PurgeCSS } = require("purgecss");
const sass = require("sass");

const pageDir = path.join(process.cwd(), "pages/");

async function setup(file) {
  // Read Site Configuration
  const config = fse.readJsonSync(file);
  app.locals.siteDir = config.siteDirectory;
  app.locals.pageDir = config.pageDirectory;
  app.locals.viewDir = config.viewDirectory;

  // Remove previous site build
  fse.removeSync(app.locals.siteDir);

  // Ensure needed directories exist
  fse.ensureDirSync(`${process.cwd()}/${app.locals.siteDir}`);
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
      permalink: "",
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

  // build custom admin stylesheet
  const sassResult = sass.compile("admin/views/admin/style.scss", {
    style: "compressed",
  });

  fse.outputFileSync("admin/assets/style.css", sassResult.css);
}

module.exports = { setup };
