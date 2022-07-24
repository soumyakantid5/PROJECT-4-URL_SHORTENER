const express = require('express')
const router = express.Router()
const urlController = require("../controller/urlController")

// URL Shortener APIs
router.post("/url/shorten", urlController.shortenUrl)

 router.get("/:urlCode", urlController.getUrl)

//if api is invalid OR wrong URL
router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})


module.exports = router