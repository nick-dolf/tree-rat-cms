const fse = require("fs-extra");
const path = require("path");
const express = require("express");
const app = require("../../treerat"); //

const pageDir = path.join(process.cwd(), "pages/");

function setup(file) {
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
}

module.exports = { setup };
