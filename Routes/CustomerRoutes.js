const express = require("express");
const mongoose = require("mongoose");
const ExpenceModal = require("../Modals/ExpenceModal");
const customerModal = require("../Modals/CustomerModal");
const customerRouter = express.Router();

customerRouter.get("/all-cutomers", async (req, res) => {
  const allCustomers = await customerModal.find();
  res.send({ allCustomers });
});
//Single Customer
customerRouter.post("/single-customer", async (req, res) => {
  const { Email } = req.body;
  const singleCustomer = await customerModal.findOne({ Email });
  res.send({ singleCustomer });
});

customerRouter.post("/add-customer", async (req, res) => {
  const { Name, Email, Year_Since_Working, Address, description } = req.body;
  try {
    const existing = await customerModal.findOne({ Email });
    if (existing) {
      res.send({ error: "Customer with this Email already exists" });
    } else {
      const newCustomer = await customerModal({
        Name,
        Email,
        Year_Since_Working,
        Address,
        description,
      });
      await newCustomer.save();
      res.send({ message: "Customer added Successfully", newCustomer });
    }
  } catch (error) {
    res.send({ error: "Internal Network Error" });
  }
});

customerRouter.post("/delete-customer", async (req, res) => {
  const { Email } = req.body;
  console.log(Email);
  try {
    const deletedCustomer = await customerModal.findOneAndDelete({ Email });
    res.send({ message: "Customer Deleted Successfully", deletedCustomer });
  } catch (error) {
    res.send({ error: "Cannot delete the Customer" });
  }
});
module.exports = customerRouter;
