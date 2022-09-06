const express = require("express");
const mongoose = require("mongoose");
const Accounts = require("../Modals/Accounts");
const accountsRouter = express.Router();

accountsRouter.get("/get-accounts-details", async (req, res) => {
  const accounts = await Accounts.find();
  res.send({ message: "Accounts Retreived", accounts });
});

accountsRouter.post("/add-account", async (req, res) => {
  const { Account_Name, Account_Email } = req.body;
  try {
    const newAccount = await Accounts({
      Account_Name,
      Account_Email,
    });
    await newAccount.save();
    res.send({ message: "Account Created SUccessfully!", newAccount });
    console.log({ newAccount });
  } catch (error) {
    res.send({ error: "Account cannot be created" });
  }
});

accountsRouter.post("/credit-account", async (req, res) => {
  const {
    Account_Email,
    Name,
    Email,
    Project_Name,
    Project_Code,
    ReceiveAs,
    Ammount,
    Currency,
    Date,
  } = req.body;
  console.log(req.body);
  try {
    await Accounts.findOneAndUpdate({ Account_Email }, {}).then(
      async (account) => {
        account.Credit.push({
          CreditBy: {
            Name,
            Email,
          },
          Source: {
            Project_Name,
            Project_Code,
          },
          ReceiveAs,
          Ammount,
          Date,
          Currency,
        });

        let sum = 0;
        for (let i = 0; i < account.Credit.length; i++) {
          sum = sum + account.Credit[i].Ammount;
        }
        account.Total_Credit = sum;
        account.Cash_Inhand = account.Total_Credit - account.Total_Debit;
        await account.save();
        res.send({ message: "Account Credited Successfully!", account });
      }
    );
  } catch (error) {
    res.send({ error: "Account cannot be Credited" });
  }
});

accountsRouter.post("/debit-account", async (req, res) => {
  const {
    Account_Email,
    Name,
    Email,
    ReceiveAs,
    Ammount,
    Date,
    Voucher_Number,
  } = req.body;
  console.log(req.body);
  try {
    await Accounts.findOneAndUpdate({ Account_Email }, {}).then(
      async (account) => {
        account.Debit.push({
          Person: {
            Name,
            Email,
          },
          ReceiveAs,
          Ammount,
          Date,
          Voucher_Number,
        });

        let sum = 0;
        for (let i = 0; i < account.Debit.length; i++) {
          sum = sum + account.Debit[i].Ammount;
        }
        account.Total_Debit = sum;
        account.Cash_Inhand = account.Total_Credit - account.Total_Debit;
        await account.save();
        res.send({ message: "Account Debited Successfully!", account });
      }
    );
  } catch (error) {
    res.send({ error: "Account cannot be Debited" });
  }
});

accountsRouter.post("/delete-debited", async (req, res) => {
  const { Account_Email, id } = req.body;
  console.log(req.body);
  await Accounts.findOneAndUpdate({ Account_Email }, {}).then(
    async (deletedDebit) => {
      const temp = deletedDebit.Debit.filter((item) => item._id != id);
      console.log(temp);
      deletedDebit.Debit = temp;
      res.send({ message: "Transaction Deleted Successfully!", deletedDebit });

      let sum = 0;
      let crSum = 0;
      for (let i = 0; i < deletedDebit.Debit.length; i++) {
        sum = sum + deletedDebit.Debit[i].Ammount;
      }
      for (let i = 0; i < deletedDebit.Credit.length; i++) {
        crSum = crSum + deletedDebit.Credit[i].Ammount;
      }
      deletedDebit.Total_Debit = sum;
      deletedDebit.Total_Credit = crSum;
      deletedDebit.Cash_Inhand =
        deletedDebit.Total_Credit - deletedDebit.Total_Debit;
      return deletedDebit.save();
    }
  );
});
module.exports = accountsRouter;
