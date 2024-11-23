const express = require("express");
const router = express.Router();

router.get("/",(reqq, res) => {
  res.adminRender('site-settings', {link: "site-settings"})
})

module.exports = router;