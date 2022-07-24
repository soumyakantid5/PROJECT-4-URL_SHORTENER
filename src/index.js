const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const route = require("./routes/route")
const app = express()

app.use(bodyParser.json())

mongoose.connect("mongodb+srv://soumya-db:afdbyZgt3CyQporD@cluster0.gvqtfzu.mongodb.net/Project4_Url-Shorten", { useNewUrlParser: true })
.then(() => console.log("MongoDb Connected..."))
.catch(err => console.log(err))

app.use("/", route)

app.listen(3000, () =>
    console.log("Express App Is Running On 3000")
)