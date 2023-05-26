const express = require("express");
const router = express.Router();

router.get("/jquery.min.js", (req,res) => {
  res.sendFile(process.cwd() +"/node_modules/jquery/dist/jquery.min.js")
})


module.exports = router;