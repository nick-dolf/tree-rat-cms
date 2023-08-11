const express = require("express");
const router = express.Router();


/*
/ Read (GET)
*/
router.get("/*", (req, res) => {
  res.adminRender("files");
});

module.exports = router;