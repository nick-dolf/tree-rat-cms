const express = require("express");
const router = express.Router();

router.get("/",(reqq, res) => {
  res.adminRender('dev', {link: "dev"})
})

module.exports = router;
