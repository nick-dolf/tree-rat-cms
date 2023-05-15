require("dotenv").config();
const PORT = 7533;
const express = require("express");
const app = express();
module.exports = app;
const build = require("./admin/utils/build");

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

  // Make HTML easy to read in development
  app.locals.pretty = true;
}

app.set("view engine", "ejs");
app.set("views", ["admin/views", "views"]);

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
