const express = require("express");
const mongoose = require("mongoose");
const employersModal = require("../Modals/EmployersModal");
const SalariesModal = require("../Modals/SalariesModal");

const employerRouter = express.Router();

//See all Employers
employerRouter.get("/allEmployers", async (req, res) => {
  const allUsers = await employersModal.find();
  res.send({ message: "Users will be displayed...", All_Users: allUsers });
});

//Hire Employer
employerRouter.post("/add-employer", async (req, res) => {
  const {
    Name,
    Email,
    Designation,
    Phone,
    Gender,
    Address,
    description,
    BasicSalary,
    StartDate,
    // Date,
    // Amount,
    // Paid,
  } = req.body;
  try {
    const alreadyExist = await employersModal.findOne({ Email });
    if (alreadyExist) {
      res.send({ error: "Employer Already Exists" });
      return;
    } else {
      const newEmployer = await employersModal({
        Name,
        Email,
        Designation,
        Phone,
        Gender,
        Address,
        BasicSalary,
        description,
        StartDate,
        //   Date,
        //   Amount,
        //   Paid,
      });
      const salaryRecord = await SalariesModal({
        Name,
        Email,
        Basic_Salary: BasicSalary,
      });
      await salaryRecord.save();
      await newEmployer.save();
      res.send({
        message: "Employer Registered Successfully!!!",
        New_Employer: newEmployer,
      });
    }
  } catch (error) {
    res.send({ error });
  }
});

//Add Monthly Salary
employerRouter.post("/add-salary", async (req, res) => {
  try {
    const { Email, Date, Amount, Paid } = req.body;
    await employersModal
      .findOneAndUpdate({ Email }, {})
      .then(async (salary) => {
        salary.SalaryDetails.push({
          Date,
          Amount,
          Paid,
        });
        return salary.save();
      })
      .then((updatedEmployer) => {
        res.send({
          message: "Expence is Updated Successfully",
          data: updatedEmployer,
        });
      })
      .catch((error) => {
        console.log("No Record Found with Existing Exp_Code : ", error);
      });
  } catch (error) {
    console.log("Error while updating the Profile: ", error);
    return res.send({
      status: false,
      error: "Error while updating the profile",
    });
  }
});

//Update Employer
employerRouter.patch("/update-employer", async (req, res) => {
  const { Name, Email, Designation, Phone, Gender, Address, BasicSalary } =
    req.body;
  await employersModal
    .findOneAndUpdate(
      { Email },
      {
        Name,
        Email,
        Designation,
        Phone,
        Gender,
        Address,
        BasicSalary,
      }
    )
    .then((updatedEmployer) => {
      return updatedEmployer.save();
    })
    .then((updated) => {
      res.send({
        message: "Employer Updated Successfully!!!",
        employer: updated,
      });
    })
    .catch((error) => {
      res.send({ error });
    });
});

//Delete Employer
employerRouter.delete("/remove-employer", async (req, res) => {
  const { Email } = req.body;
  try {
    await employersModal.findOneAndDelete({ Email }).then((deletedEmp) => {
      res.send({
        message: "Employer Removed Successfully!!!",
        employer: deletedEmp,
      });
    });
  } catch (error) {
    res.send({ error });
  }
});

employerRouter.post("/copy-all", async (req, res) => {
  await employersModal.find().then(async (employers) => {
    for (var i = 0; i < employers.length; i++) {
      await SalariesModal({
        Name: employers[i].Name,
        Email: employers[i].Email,
        Basic_Salary: employers[i].BasicSalary,
      }).save();
    }
    res.send({ message: "Salary Copied" });
  });
});
module.exports = employerRouter;
