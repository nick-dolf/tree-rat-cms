const express = require("express");
const router = express.Router();

router.use("/assets", express.static("admin/assets"))

router.get("/login", (req, res) => {
  res.render("admin/login", { heading: "Login" });
});

module.exports = router;