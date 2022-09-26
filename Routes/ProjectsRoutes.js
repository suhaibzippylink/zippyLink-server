const express = require("express");
const mongoose = require("mongoose");
const ExpenceModal = require("../Modals/ExpenceModal");
const ProjectsModal = require("../Modals/ProjectsModal");
const CustomerModal = require("../Modals/CustomerModal");
const Accounts = require("../Modals/Accounts");
const projectRouter = express.Router();
const multer = require("multer");
var path = require("path");

let gCode = "PR_000";
//Get all Projects
projectRouter.get("/all-projects", async (req, res) => {
  const allProjects = await ProjectsModal.find();
  res.send({ Projects: allProjects });
});
//Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/Files");
  },
  filename: function (req, file, cb) {
    // cb(null, "PR_001" + "-" + file.originalname);
    return cb(null, `PR_000_${Date.now()}${path.extname(file.originalname)}`);
  },
});
//Upload
const upload = multer({ storage: storage });
//File Upload
projectRouter.post("/file-upload/:code", upload.single("file"), (req, res) => {
  const code = req.params.code;
  console.log("Code is: ", code);
  gCode = code;
  if (!req.file) {
    res.send({
      success: false,
      error: "File Can not be added",
    });
  }
  res.send({
    success: true,
    message: "File Saved Successfully",
    file_url: `https://zippylink-server.herokuapp.com/file/${req.file.filename}`,
  });
});
//Add new Project
projectRouter.post("/add-project", async (req, res) => {
  try {
    const {
      Project_Code,
      Date,
      Customer,
      Project_Title,
      Project_Nature,
      Product,
      Supplier,
      Status,
      Budget,
      Currency,
      Cost,
      Description,
      Account_Email,
      Name,
      Email,
      File,
    } = req.body;
    console.log("Body: ", req.body);

    const alreadyExist = await ProjectsModal.findOne({ Project_Code });
    if (alreadyExist) {
      res.send({ error: "Project with this code already exists." });
      return;
    }
    const newProject = await ProjectsModal({
      Project_Code,
      Date,
      Customer,
      Project_Title,
      Project_Nature,
      Product,
      Supplier,
      Status,
      Budget,
      Currency: Currency ? Currency : "AFN",
      Cost,
      Description,
      File,
    });
    if (!newProject) return res.send({ error: "Project Cannot be Added" });
    await newProject.save();
    res.send({
      message: "Project added successfully!!!",
      New_Project: newProject,
    });
    try {
      await Accounts.findOneAndUpdate({ Account_Email, Currency }, {}).then(
        async (account) => {
          account.Total_Debit = account.Total_Debit + Cost;
          account.Credit.push({
            CreditBy: {
              Name,
              Email,
            },
            Source: {
              Project_Name: Project_Title,
              Project_Code,
            },
            ReceiveAs: `Value of ${Project_Title}`,
            Ammount: Budget,
            Date,
            Currency,
          });

          account.Total_Credit = account.Total_Credit + Budget;
          account.Cash_Inhand = account.Total_Credit - account.Total_Debit;
          await account.save();
          try {
            await CustomerModal.findOneAndUpdate({ Name: Customer }, {}).then(
              async (customer) => {
                customer.Projects.push({
                  Project_Code,
                  Date,
                  Project_Title,
                  Project_Nature,
                  Budget,
                  Cost,
                });
                await customer.save();
                console.log("Customer: ", customer);
              }
            );
          } catch (error) {
            console.log(error);
          }
          return res.send({
            message: "Account Credited Successfully!",
          });
        }
      );
    } catch (error) {
      return res.send({ error: "Account cannot be Credited!" });
    }
  } catch (error) {
    // res.send({ error: "Project Cannot be Added" });
  }
});

//Add Project Cost
projectRouter.post("/add-project-cost", async (req, res) => {
  const {
    projectCode,
    Cost_Title,
    Cost_Type,
    Ammount,
    CreatedAt,
    Account_Email,
    Name,
    Email,
    Voucher_Number,
    Currency,
  } = req.body;
  console.log(req.body);
  try {
    await ProjectsModal.findOneAndUpdate(
      { Project_Code: projectCode },
      {}
    ).then(async (project) => {
      project.Project_Cost.push({
        Cost_Title,
        Cost_Type,
        Ammount,
        CreatedAt,
        Voucher_Number,
      });
      await project.save();

      res.send({
        message: "Project Cost Added Successfully!",
        projectCost: project.Project_Cost,
      });

      project.Cost = project.Cost + Ammount;
      console.log();
      await project.save();
      try {
        await Accounts.findOneAndUpdate({ Account_Email, Currency }, {}).then(
          async (account) => {
            if (!account) return res.send({ error: "Account does not exist" });
            account.Debit.push({
              Person: {
                Name,
                Email,
              },
              ReceiveAs: `${Cost_Type} Expence`,
              Ammount,
              Voucher_Number,
              Currency,
            });

            account.Total_Debit = account.Total_Debit + Ammount;
            account.Cash_Inhand = account.Total_Credit - account.Total_Debit;

            await account.save();
            return res.send({ message: "Account Debited Successfully!" });
          }
        );
      } catch (error) {
        res.send({ error: "Account Not debited" });
      }
    });
  } catch (error) {
    // res.send({
    //   error: "Project Cost Cannot be added! Please Check the Network",
    // });
  }
});

//SIngle Project
projectRouter.post("/single-Project", async (req, res) => {
  const { Project_Code } = req.body;
  console.log(Project_Code);
  const project = await ProjectsModal.findOne({ Project_Code });
  res.send({ project });
});

//Update Project
projectRouter.post("/update-project", async (req, res) => {
  try {
    const {
      Project_Code,
      Date,
      Customer,
      Project_Title,
      Project_Nature,
      Product,
      Supplier,
      Status,
      Budget,
      Cost,
      Description,
    } = req.body;
    await ProjectsModal.findOneAndUpdate(
      { Project_Code },
      {
        Project_Code,
        Date,
        Customer,
        Project_Title,
        Project_Nature,
        Product,
        Supplier,
        Status,
        Budget,
        Cost,
        Revenue: Budget - Cost,
        Description,
      }
    ).then(async (updated) => {
      await updated.save();
      res.send({
        message: "Project Updated Successfully!!!",
        project: updated,
      });
    });
  } catch (error) {
    res.send({ error });
  }
});
module.exports = projectRouter;
