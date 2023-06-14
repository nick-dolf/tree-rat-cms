/** @format */

require("dotenv").config();
const PORT = 7533;
const express = require("express");
const app = express();
module.exports = app;
const build = require("./admin/utils/build");
const ejs = require("ejs");

// Live Reload
const livereload = require("livereload");
const liveReloadServer = livereload.createServer();

const connectLivereload = require("connect-livereload");
app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

build.setup("treerat.json");

if (process.env.NODE_ENV === "development") {
  console.log("Environment: Development");
}

app.set("view engine", "ejs");
app.set("views", ["admin/views", "views"]);

app.use((req, res, next) => {
  res.adminRender = (file, data) => {
    ejs.renderFile(process.cwd() + "/admin/views/admin/" + file + ".ejs", { page: data, ...app.locals}, (err, html) => {
      if (err) {
        return res.send(`<body>${err.message}</body>`);
      }
      res.send(html);
    });
  };
  next();
});

app.get("/", (req, res) => {
  res.render("default");
});

// Log request
app.use("/", (req, res, next) => {
  console.log(req.method, req.url);
  next();
});

/*
/ Admin Route
*/
app.use("/admin", require("./admin/routes/admin"));

app.listen(PORT, () => {
  console.log(`\n--\nTree Rat CMS Starting on port: ${PORT}\n--`);
});
