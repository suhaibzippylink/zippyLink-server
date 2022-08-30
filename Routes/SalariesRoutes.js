const express = require("express");
const mongoose = require("mongoose");
const ExpenceModal = require("../Modals/ExpenceModal");
const MonthlySalaryModal = require("../Modals/MonthlySalaryModal");
const SalariesModal = require("../Modals/SalariesModal");
const salaryRouter = express.Router();

salaryRouter.get("/all-salaries", async (req, res) => {
  const allSalaries = await SalariesModal.find();
  res.send({ Salaries: allSalaries });
});

salaryRouter.post("/update-salary", async (req, res) => {
  const { id, PaidAt } = req.body;
  console.log("Body for update Status: ", req.body);
  await SalariesModal.findOneAndUpdate(
    { _id: id },
    {
      Paid: true,
      PaidAt,
    }
  ).then((updatedSalary) => {
    res.send({ message: "Salary Paid Successfully!", updatedSalary });
  });
});

salaryRouter.post("/add-newMonth", async (req, res) => {
  const { Month } = req.body;
  let allRecords = await SalariesModal.find();
  // let totalSalaries = 0;
  // for (var i = 0; i < allRecords.length; i++) {
  //   totalSalaries = totalSalaries + allRecords.Employers[i].Net_Salary;
  // }
  // console.log("Total Salaries: ", totalSalaries);
  const newMonthSalaries = await MonthlySalaryModal({
    Month,
    Employers: allRecords,
  });

  await newMonthSalaries.save();
  await MonthlySalaryModal.findOneAndUpdate({ Month }, {})
    .then(async (record) => {
      for (var i = 0; i < record.Employers.length; i++) {
        record.Employers[i].Paid = false;
        record.PaidSalaries =
          record.PaidSalaries + record.Employers[i].Net_Salary;
      }
      return await record.save();
    })
    .then((rec) => {
      res.send({ message: "Salary Record Created!", rec });
    });
});

salaryRouter.post("/pay-monthly", async (req, res) => {
  // const {
  //   Month,
  //   Name,
  //   Email,
  //   Working_Days,
  //   Basic_Salary,
  //   Calculated_Salary,
  //   TAX,
  //   Net_Salary,
  //   Paid,
  //   PaidAt,
  // } = req.body;
  // console.log("Body: ", req.body);
  // try {
  //   await MonthlySalaryModal.findOneAndUpdate({ Month })
  //     .then((sal) => {
  //       sal.Employers.push({
  //         Name,
  //         Email,
  //         Working_Days,
  //         Basic_Salary,
  //         Calculated_Salary,
  //         TAX,
  //         Net_Salary,
  //         Paid,
  //         PaidAt,
  //       });
  //       return sal.save();
  //     })
  //     .then((updatedSalary) => {
  //       res.send({
  //         message: "Monthly Salary Paid Successfully!",
  //         updatedSalary,
  //       });
  //     });
  // } catch (error) {
  //   res.send({ error: "Network Error", err: error });
  // }
  const { id, month, payDate, advanceDeduction } = req.body;
  console.log("Req dot body: ", req.body);
  try {
    await MonthlySalaryModal.findOneAndUpdate(
      {
        Month: month,
      },
      {}
    )
      .then((item) => {
        for (let i = 0; i < item.Employers.length; i++) {
          if (item.Employers[i]._id == id) {
            item.Employers[i].Paid = true;
            item.Employers[i].PaidAt = payDate;
            if (
              item.Employers[i].AdvancePay > advanceDeduction &&
              item.Employers[i].Net_Salary > advanceDeduction
            )
              item.Employers[i].AdvancePay =
                item.Employers[i].AdvancePay - advanceDeduction;
            item.Employers[i].Net_Salary =
              item.Employers[i].Net_Salary - advanceDeduction;
          }
        }
        console.log(item.Employers[0]);
        return item.save();
      })
      .then((rec) => {
        res.send({ message: "Salary Paid Successfully!", rec });
      });
  } catch (error) {
    res.send({ error });
  }
});

//Fetch Selected Month record
salaryRouter.post("/selected-month", async (req, res) => {
  const { month } = req.body;
  try {
    const selectedMonth = await MonthlySalaryModal.findOne({ Month: month });
    if (!selectedMonth) {
      res.send({ error: "Record not found for this month!" });
      return;
    }
    res.send({ message: "Data fetched!", selectedMonth });
  } catch (error) {
    res.send({ error });
  }
});

//Advance Payment
salaryRouter.post("/pay-advance", async (req, res) => {
  const { AdvancePay, month, id } = req.body;
  try {
    await MonthlySalaryModal.findOneAndUpdate(
      {
        Month: month,
      },
      {}
    )
      .then((item) => {
        for (let i = 0; i < item.Employers.length; i++) {
          if (item.Employers[i]._id == id) {
            item.Employers[i].AdvancePay = AdvancePay;
          }
        }
        console.log(item.Employers);
        return item.save();
      })
      .then((rec) => {
        res.send({ message: "Advance Paid Successfully!", rec });
      });
  } catch (error) {
    res.send({ error });
  }
});
module.exports = salaryRouter;
