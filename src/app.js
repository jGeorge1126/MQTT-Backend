const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const morgan = require("morgan");
const cors = require("cors")
const app = express();
const server = require('http').createServer(app);
// const mqtt = require('mqtt')
// var socketIo = require('socket.io'); 
// const { Command } = require('commander')
// const program = new Command()


app.use(cors())

// const io = socketIo(server, {
//   cors: {
//         // origin: "http://34.224.66.154:3000",
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//       }
// })



// Settings
app.set("port", process.env.PORT || 8080);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs.create({
    defaultLayout: "main",
    extname: ".hbs",
  }).engine
);
app.set("view engine", ".hbs");

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use(require("./routes/index"));
app.use(require("./routes/mqtt"));

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));


module.exports = server;