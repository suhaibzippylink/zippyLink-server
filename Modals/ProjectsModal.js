const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectsSchema = new Schema({
  Project_Code: {
    type: String,
    required: true,
    default: "PR_000",
  },
  Date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  Customer: {
    type: String,
    required: true,
  },
  Project_Title: {
    type: String,
    required: true,
  },
  Project_Nature: {
    type: String,
    required: true,
  },
  Product: {
    type: String,
    required: true,
  },
  Supplier: {
    type: String,
    required: true,
  },
  Budget: {
    type: Number,
    required: true,
    default: 0,
  },
  Cost: {
    type: Number,
    required: true,
    default: 0,
  },
  Currency: {
    type: String,
    required: true,
    default: "AFN",
  },
  Project_Cost: [
    {
      Cost_Title: {
        type: String,
        required: true,
        default: "Cost_Title",
      },
      Cost_Type: {
        type: String,
        required: true,
        default: "Cost_Type",
      },
      Ammount: {
        type: Number,
        required: true,
        default: 0,
      },
      CreatedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      Voucher_Number: {
        type: String,
        required: true,
        default: "000000",
      },
    },
  ],
  Status: {
    type: String,
    required: true,
    default: "In Progress",
  },
  Revenue: {
    type: Number,
    required: true,
    default: function () {
      return this.Budget - this.Cost;
    },
  },
  Description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("projectModal", projectsSchema);
