const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectsSchema = new Schema({
  Project_Code: { type: String, required: true, default: "PR_000" },
  Date: { type: Date, required: true, default: Date.now },
  Deadline: { type: Date },
  Customer: { type: String, required: true },
  Project_Title: { type: String, required: true },
  Project_Nature: { type: String, required: true },
  Product: { type: String, required: true },
  Supplier: { type: String, required: true },
  Budget: { type: Number, required: true, default: 0 },
  Exchange_Rate: { type: Number, required: true, default: 85.2 },
  Alternate_Budget: {
    type: Number,
    required: true,
    default: function () {
      return this.Currency === "AFN"
        ? (this.Budget / this.Exchange_Rate).toFixed(2)
        : (this.Budget * this.Exchange_Rate).toFixed(2);
    },
  },
  BRT: {
    type: Number,
    required: true,
    default: function () {
      return (this.Budget * 0.02).toFixed(2);
    },
  },
  Alternate_BRT: {
    type: Number,
    required: true,
    default: function () {
      return (this.Alternate_Budget * 0.02).toFixed(2);
    },
  },
  NetAmmount: {
    type: Number,
    required: true,
    default: function () {
      return (this.Budget - this.BRT).toFixed(2);
    },
  },
  Alternate_NetAmmount: {
    type: Number,
    required: true,
    default: function () {
      return this.Currency === "AFN"
        ? (this.NetAmmount / this.Exchange_Rate).toFixed(2)
        : (this.NetAmmount * this.Exchange_Rate).toFixed(2);
    },
  },
  Cost: { type: Number, required: true, default: 0 },
  Alternate_Cost: {
    type: Number,
    required: true,
    default: function () {
      return this.Currency === "AFN"
        ? (this.Cost / this.Exchange_Rate).toFixed(2)
        : (this.Cost * this.Exchange_Rate).toFixed(2);
    },
  },
  Alternate_Currency: {
    type: String,
    required: true,
    default: function () {
      return this.Currency === "AFN" ? "USD" : "AFN";
    },
  },
  Currency: { type: String, required: true, default: "AFN" },
  Project_Cost: [
    {
      Cost_Title: { type: String, required: true, default: "Cost_Title" },
      Cost_Type: { type: String, required: true, default: "Cost_Type" },
      Ammount: { type: Number, required: true, default: 0 },
      CreatedAt: { type: Date, required: true, default: Date.now },
      Voucher_Number: { type: String, required: true, default: "000000" },
      Exchange_Rate: { type: Number, required: true, default: 85.2 },
      Alternate_Currency: {
        type: String,
        required: true,
        default: function () {
          return this.Currency === "USD"
            ? "AFN"
            : this.Currency === "AFN"
            ? "USD"
            : "AFN";
        },
      },
      Alternate_Ammount: {
        type: Number,
        required: true,
        default: function () {
          return this.Currency === "AFN"
            ? (this.Ammount / this.Exchange_Rate).toFixed(2)
            : (this.Ammount * this.Exchange_Rate).toFixed(2);
        },
      },
    },
  ],
  Status: { type: String, required: true, default: "In Progress" },
  Revenue: {
    type: Number,
    required: true,
    default: function () {
      return (this.NetAmmount - this.Cost).toFixed(2);
    },
  },
  Alternate_Revenue: {
    type: Number,
    required: true,
    default: function () {
      return (this.Alternate_NetAmmount - this.Alternate_Cost).toFixed(2);
    },
  },
  Description: { type: String, required: true },
  File: { type: String },
});

module.exports = mongoose.model("projectModal", projectsSchema);
