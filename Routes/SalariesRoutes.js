const express = require("express");
const mongoose = require("mongoose");
const MonthlySalaryModal = require("../Modals/MonthlySalaryModal");
const SalariesModal = require("../Modals/SalariesModal");
const Accounts = require("../Modals/Accounts");
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
  // const { Month } = req.body;
  // let allRecords = await SalariesModal.find();
  // const newMonthSalaries = await MonthlySalaryModal({
  //   Month,
  //   Employers: allRecords,
  // });

  // await newMonthSalaries.save();
  // await MonthlySalaryModal.findOneAndUpdate({ Month }, {})
  //   .then(async (record) => {
  //     for (var i = 0; i < record.Employers.length; i++) {
  //       record.Employers[i].Paid = false;
  //       record.PaidSalaries =
  //         record.PaidSalaries + record.Employers[i].Net_Salary;
  //     }
  //     return await record.save();
  //   })
  //   .then((rec) => {
  //     res.send({ message: "Salary Record Created!", rec });
  //   });
  const { Month } = req.body;
  const temp = await MonthlySalaryModal.find();
  const allRecords = temp[temp.length - 1].Employers;
  console.log(allRecords);
  const newMonthSalaries = await MonthlySalaryModal({
    Month,
    Employers: allRecords,
  });
  await newMonthSalaries.save();
  await MonthlySalaryModal.findOneAndUpdate({ Month }, {})
    .then(async (record) => {
      for (var i = 0; i < record.Employers.length; i++) {
        record.Employers[i].Paid = false;
        record.Employers[i].Net_Salary =
          record.Employers[i].Calculated_Salary - record.Employers[i].TAX;
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
  const {
    id,
    month,
    payDate,
    advanceDeduction,
    Account_Email,
    Name,
    Email,
    Voucher_Number,
  } = req.body;
  console.log("Req dot body: ", req.body);
  try {
    await MonthlySalaryModal.findOneAndUpdate(
      {
        Month: month,
      },
      {}
    )
      .then(async (item) => {
        for (let i = 0; i < item.Employers.length; i++) {
          if (item.Employers[i]._id == id) {
            item.Employers[i].Paid = true;
            item.Employers[i].PaidAt = payDate;
            if (
              item.Employers[i].AdvancePay >= advanceDeduction &&
              item.Employers[i].Net_Salary >= advanceDeduction
            )
              item.Employers[i].AdvancePay =
                item.Employers[i].AdvancePay - advanceDeduction;
            item.Employers[i].Net_Salary =
              item.Employers[i].Net_Salary - advanceDeduction;

            try {
              await Accounts.findOneAndUpdate(
                { Account_Email, Currency: "AFN" },
                {}
              ).then(async (account) => {
                if (!account)
                  return res.send({ error: "Account does not exist" });
                account.Debit.push({
                  Person: {
                    Name,
                    Email,
                  },
                  ReceiveAs: `Salary Expence`,
                  Ammount: item.Employers[i].Net_Salary,
                  Voucher_Number,
                });

                let sum = 0;
                for (let i = 0; i < account.Debit.length; i++) {
                  sum = sum + account.Debit[i].Ammount;
                }
                account.Total_Debit = sum;
                account.Cash_Inhand =
                  account.Total_Credit - account.Total_Debit;

                await account.save();
                return res.send({ message: "Account Debited Successfully!" });
              });
            } catch (error) {
              res.send({ error: "Account Cannot be Debited!" });
            }
          }
        }
        console.log(item.Employers[0]);
        return item.save();
      })
      .then((rec) => {
        res.send({ message: "Salary Paid Successfully!", rec });
      });
  } catch (error) {
    // res.send({ error });
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
  const { AdvancePay, month, id, Account_Email, Name, Email, Voucher_Number } =
    req.body;
  try {
    await MonthlySalaryModal.findOneAndUpdate(
      {
        Month: month,
      },
      {}
    )
      .then(async (item) => {
        for (let i = 0; i < item.Employers.length; i++) {
          if (item.Employers[i]._id == id) {
            item.Employers[i].AdvancePay =
              item.Employers[i].AdvancePay + AdvancePay;
            try {
              await Accounts.findOneAndUpdate(
                { Account_Email, Currency: "AFN" },
                {}
              ).then(async (account) => {
                if (!account)
                  return res.send({ error: "Account does not exist" });
                account.Debit.push({
                  Person: {
                    Name,
                    Email,
                  },
                  ReceiveAs: `Salary Advance Expence`,
                  Ammount: AdvancePay,
                  Voucher_Number,
                });

                let sum = 0;
                for (let i = 0; i < account.Debit.length; i++) {
                  sum = sum + account.Debit[i].Ammount;
                }
                account.Total_Debit = sum;
                account.Cash_Inhand =
                  account.Total_Credit - account.Total_Debit;

                await account.save();
                return res.send({ message: "Account Debited Successfully!" });
              });
            } catch (error) {
              res.send({ error: "Account Cannot be Debited!" });
            }
          }
        }
        console.log(item.Employers);
        return item.save();
      })
      .then((rec) => {
        res.send({ message: "Advance Paid Successfully!", rec });
      });
  } catch (error) {
    // res.send({ error });
  }
});

module.exports = salaryRouter;
