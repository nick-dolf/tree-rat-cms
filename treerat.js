require("dotenv").config();
const PORT = 7533;
const express = require("express");
const app = express();
module.exports = app;
const build = require("./admin/utils/build");
const imgProc = require("./admin/utils/imgProc");
const ejs = require("ejs");
const fse = require("fs-extra")
const marked = require("marked");
marked.setOptions({ breaks: true, mangle: false, headerIds: false });
const sanitizeHtml = require("sanitize-html");
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
  app.use(express.static(app.locals.siteDir));
} else if (process.env.NODE_ENV === "development") {
  console.log("Environment: Staging");
}

/*
 * Render Middleware
 */
app.use((req, res, next) => {
  res.adminRender = (file, data) => {
    console.log(file, data)
    ejs.renderFile(process.cwd() + "/admin/views/" + file + ".ejs", { page: data, ...app.locals }, (err, html) => {
      if (err) {
        return res.send(`<body >${err.message.replace(/(?:\n)/g, "<br>")}</body>`);
      }
      res.send(html);
    });
  };
  next();
});
app.use((req, res, next) => {
  res.siteRender = (file, data) => {
    let promises = []
    ejs.renderFile(app.locals.viewDir + "/" + file + ".ejs", { page: data, ...app.locals, promises }, (err, html) => {
      if (err) {
        return res.send(`<body >${err.message.replace(/(?:\n)/g, "<br>")}</body>`);
      }
      Promise.all(promises).then(() => {
        res.send(html);
      })
    });
  };
  next();
});
// Render page to process images without sending to client
app.use((req, res, next) => {
  res.preRender = (file, data) => {
    ejs.renderFile(app.locals.viewDir + "/" + file + ".ejs", { page: data, ...app.locals }, (err, html) => {
      if (err) {
        return res.send(`<body >${err.message.replace(/(?:\n)/g, "<br>")}</body>`);
      }
    });
  };
  next();
});


// Convert Markdown and sanitize the HTML
app.locals.md = (data) => {
  return sanitizeHtml(marked.parse(data));
};

app.locals.publishImg = imgProc.publishImg;
app.locals.publishPage = (file, data) => {
  ejs.renderFile(app.locals.viewDir + "/" + file + ".ejs", { page: data, ...app.locals }, (err, html) => {
    if (err) {
      console.error(err.message);
    }
    const link = (data.link != "home" ? "/"+data.link+"/" : "/")
    console.log(data.link)
    fse.outputFile(app.locals.siteDir + link + "index.html", html)
  });
};

// Log request
app.use("/", (req, res, next) => {
  console.log(req.method, req.url);
  next();
});

/**
 * Build Site
 */
build.buildSite();

/*
/ Admin Route
*/
app.use("/admin", require("./admin/routes/admin"));

app.listen(PORT, () => {
  console.log(`\n--\nTree Rat CMS Starting on port: ${PORT}\n--`);
});
