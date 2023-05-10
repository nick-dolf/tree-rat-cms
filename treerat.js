const PORT = 7533;
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("TREE RAT");
});

app.listen(PORT, () => {
  console.log(`\n--\nTree Rat CMS Starting on port: ${PORT}\n--`);
});
