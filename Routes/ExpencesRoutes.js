const express = require("express");
const mongoose = require("mongoose");
const Accounts = require("../Modals/Accounts");
const ExpenceModal = require("../Modals/ExpenceModal");
const expRouter = express.Router();

expRouter.get("/allExpences", async (req, res) => {
  const allExps = await ExpenceModal.find();
  res.send({ message: "All Expences here...", allExps });
});

expRouter.post("/add-newExpenceRecord", async (req, res) => {
  const { Month } = req.body;
  try {
    const newExp = await ExpenceModal({
      Month,
    });
    await newExp.save();
    res.send({ message: "New Expence Record Added Successfully!!!", newExp });
  } catch (error) {
    res.send({ error: "Record Can not be added!" });
  }
});

//Add Expence
expRouter.post("/add-expence", async (req, res) => {
  const {
    Month,
    Exp_Code,
    Exp_Title,
    Item,
    Cost,
    description,
    Account_Email,
    Name,
    Email,
    Voucher_Number,
  } = req.body;
  console.log(req.body);
  try {
    await ExpenceModal.findOneAndUpdate({ Month }, {})
      .then(async (exp) => {
        if (!exp) return res.send({ error: "Expence cannot be added!" });
        exp.Expences.push({
          Exp_Code,
          Exp_Title,
          Item,
          Cost,
          description,
          Voucher_Number,
        });
        await exp.save();
        res.send({ message: "Expence Added Succesfully!", exp });
      })
      .then(async () => {
        try {
          await Accounts.findOneAndUpdate({ Account_Email }, {}).then(
            async (account) => {
              if (!account)
                return res.send({ error: "Account does not exist" });
              account.Debit.push({
                Person: {
                  Name,
                  Email,
                },
                ReceiveAs: `${Exp_Title} Expence`,
                Ammount: Cost,
                Voucher_Number,
              });

              let sum = 0;
              for (let i = 0; i < account.Debit.length; i++) {
                sum = sum + account.Debit[i].Ammount;
              }
              account.Total_Debit = sum;
              account.Cash_Inhand = account.Total_Credit - account.Total_Debit;

              await account.save();
              return res.send({ message: "Account Debited Successfully!" });
            }
          );
        } catch (error) {
          return res.send({ error: "Account cannot be Debited!" });
        }
      });
  } catch (error) {
    // return res.send({ error: "Expence Cannot Added!" });
  }
});

//Delete Expence
expRouter.post("/delete-expence", async (req, res) => {
  const { id, month } = req.body;
  console.log(req.body);
  try {
    await ExpenceModal.findOneAndUpdate({ Month: month }).then(
      async (deletedExpense) => {
        // for (var i = 0; i < deletedExpense.Expences.length; i++) {
        //   if (deletedExpense.Expences[i]._id == id) {
        //   }
        // }
        const temp = deletedExpense.Expences.filter((item) => item._id != id);
        deletedExpense.Expences = temp;
        await deletedExpense.save();
        res.send({ message: "Expence Deleted Successfully!", deletedExpense });
      }
    );
  } catch (error) {
    res.send({ error: "Cannot delete the Expence" });
  }
});

//Fetch Selected Month record
expRouter.post("/selected-month-expences", async (req, res) => {
  const { month } = req.body;
  try {
    const selectedMonth = await ExpenceModal.findOne({ Month: month });
    if (!selectedMonth) {
      res.send({ error: "Record not found for this month!" });
      return;
    }
    res.send({ message: "Data fetched!", selectedMonth });
  } catch (error) {
    res.send({ error });
  }
});

module.exports = expRouter;
