const express = require("express");
require("dotenv").config();
const cors = require("cors");
const http = require("http"); 

const AuthenticateAPI = require("./middlewares/AuthenticateAPI");
const appStart = require("./app");
const sequelize = require("./configs/db");
require("./models/index");
const path = require("path");
const { initSocket } = require("./initSocket");
const bookingFinish = require("./util/corn/bookingFinish");

const app = express();
const server = http.createServer(app);


const port = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

sequelize.sync({ alter: true });

sequelize.authenticate()
  .then(() => console.log("Postg Connected"))
  .catch(err => console.error("DB Error:", err));

app.use(express.json());
app.use(cors());

app.use("/api/v1", AuthenticateAPI, appStart);

initSocket(server);
// bookingFinish()

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
