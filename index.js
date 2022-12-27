const express = require("express")
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();
app.use(express.json());
const cors = require("cors")
const dbName = "asi";
const port = 4000;
const uri = process.env.URI;
mongoose.set('strictQuery', true);
const connect = mongoose.connect(uri, { dbName: dbName,  useNewUrlParser: true, useUnifiedTopology: true });

connect.then(() => {
    console.log("Connected");

    let guild = require("./controllers/guild");

    app.use(express.static('public'))
    app.use(cors());
    app.use("/guild", guild)


    app.listen(port, () => console.log('ASI listening on port ' + port + '!'));
});