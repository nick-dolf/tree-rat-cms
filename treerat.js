require('dotenv').config()
const PORT = 7533;
const express = require("express");
const app = express();

if (process.env.NODE_ENV === "development") {
  console.log("Environment: Development");

  // Make HTML easy to read in development
  app.locals.pretty = true;
}

app.set("view engine", "ejs")
app.set("views", ["admin/views", "views"])

app.get("/", (req, res) => {
  res.render("default");
});

app.listen(PORT, () => {
  console.log(`\n--\nTree Rat CMS Starting on port: ${PORT}\n--`);
});
