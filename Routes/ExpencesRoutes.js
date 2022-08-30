const express = require("express");
const mongoose = require("mongoose");
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

// expRouter.post("/addExpence", async (req, res) => {
//   try {
//     const { Exp_Code, Exp_Title, Date, Item, Cost, Description } = req.body;
//     console.log("Body: ", req.body);
//     await ExpenceModal.findOneAndUpdate({ Exp_Code }, {})
//       .then(async (exp) => {
//         exp.Data.push({
//           Date,
//           Item,
//           Cost,
//           Description,
//         });
//         return exp.save();
//       })
//       .then((updatedExp) => {
//         res.send({
//           message: "Expence is Updated Successfully",
//           data: updatedExp,
//         });
//       })
//       .catch((error) => {
//         console.log("No Record Found with Existing Exp_Code : ", error);
//       });
//   } catch (error) {
//     console.log("Error while updating the Profile: ", error);
//     return res.send({
//       status: false,
//       error: "Error while updating the profile",
//     });
//   }
// });

// expRouter.post("/add-expence", async (req, res) => {
//   const { Exp_Code, Exp_Title, Date, Item, Cost, description } = req.body;
//   try {
//     const newExp = await ExpenceModal({
//       Exp_Code,
//       Exp_Title,
//       Date,
//       Item,
//       Cost,
//       description,
//     });
//     await newExp.save();
//     res.send({ message: "Expence Added Successfully!!!", newExp });
//   } catch (error) {
//     res.send({ error });
//   }
// });

//Add Expence
expRouter.post("/add-expence", async (req, res) => {
  const { Month, Exp_Code, Exp_Title, Item, Cost, description } = req.body;
  try {
    await ExpenceModal.findOneAndUpdate({ Month }, {})
      .then(async (exp) => {
        exp.Expences.push({
          Exp_Code,
          Exp_Title,
          Item,
          Cost,
          description,
        });
        await exp.save();
      })
      .then(async (record) => {
        res.send({ message: "Expence Added Succesfully!", record });
      });
  } catch (error) {
    console.log(error);
    res.send({ error: "Expence Cannot be added!" });
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
