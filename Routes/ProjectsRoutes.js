const express = require("express");
const mongoose = require("mongoose");
const ExpenceModal = require("../Modals/ExpenceModal");
const ProjectsModal = require("../Modals/ProjectsModal");
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
    } = req.body;
    console.log(req.body);
    const alreadyExist = await ProjectsModal.findOne({ Project_Code });
    if (alreadyExist) {
      res.send({ error: "Project with this code already exists." });
      return;
    } else {
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
      await newProject.save();
      res.send({
        message: "Project added successfully!!!",
        New_Project: newProject,
      });
    }
  } catch (error) {
    res.send({ error });
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
