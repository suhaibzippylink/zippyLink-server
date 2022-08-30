require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./Routes/UserRoutes");
const expRouter = require("./Routes/ExpencesRoutes");
const employerRouter = require("./Routes/EmployerRoutes");
const projectRouter = require("./Routes/ProjectsRoutes");
const salaryRouter = require("./Routes/SalariesRoutes");
const customerRouter = require("./Routes/CustomerRoutes");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(router);
app.use(expRouter);
app.use(employerRouter);
app.use(projectRouter);
app.use(salaryRouter);
app.use(customerRouter);
app.get("/", (req, res) => {
  res.send({ message: "Zippy Link Web Server is ON." });
});

const port = 4000;
mongoose
  .connect(process.env.DATABASE)
  .then((res) => {
    app.listen(port, () => {
      console.log(`Server is Listening on Port: ${port}`);
    });
    console.log("Mongoose is connected....");
  })
  .catch((error) => {
    console.log("Mongoose Connection Error: ", error);
  });