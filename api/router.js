const express = require("express");
const path = require("path");
const router = express.Router();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

router.use(cors());
router.use(morgan("combined"));

router.use(express.static(path.join(__dirname, "../build")));

router.get("/api", (req, res) => {
  res
    .send({
      response: "👍☺️🏭🥞 Server is up and running. 🥞🏭☺️👍",
    })
    .status(200);
});

router.get("/", function (req, res) {
  res.sendfile("build/index.html");
});

module.exports = router;
