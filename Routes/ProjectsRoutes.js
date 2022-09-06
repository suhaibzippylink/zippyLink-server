const express = require("express");
const mongoose = require("mongoose");
const ExpenceModal = require("../Modals/ExpenceModal");
const ProjectsModal = require("../Modals/ProjectsModal");
const Accounts = require("../Modals/Accounts");
const projectRouter = express.Router();

//Get all Projects
projectRouter.get("/all-projects", async (req, res) => {
  const allProjects = await ProjectsModal.find();
  res.send({ Projects: allProjects });
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
    } = req.body;
    console.log(req.body);
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
      Currency,
      Cost,
      Description,
    });
    if (!newProject) return res.send({ error: "Project Cannot be Added" });
    await newProject.save();
    res.send({
      message: "Project added successfully!!!",
      New_Project: newProject,
    });
    try {
      await Accounts.findOneAndUpdate({ Account_Email }, {}).then(
        async (account) => {
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
          });

          let sum = 0;
          for (let i = 0; i < account.Credit.length; i++) {
            sum = sum + account.Credit[i].Ammount;
          }
          account.Total_Credit = sum;
          account.Cash_Inhand = account.Total_Credit - account.Total_Debit;
          await account.save();
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
  const { projectCode, Cost_Title, Cost_Type, Ammount, CreatedAt } = req.body;
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
      });
      await project.save();
      res.send({
        message: "Project Cost Added Successfully!",
        projectCost: project.Project_Cost,
      });
      let sum = 0;
      for (let i = 0; i < project.Project_Cost.length; i++) {
        sum = sum + project.Project_Cost[i].Ammount;
      }
      project.Cost = sum;
      await project.save();
    });
  } catch (error) {
    res.send({
      error: "Project Cost Cannot be added! Please Check the Network",
    });
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
