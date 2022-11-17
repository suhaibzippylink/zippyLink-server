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
        ? this.Budget / this.Exchange_Rate
        : this.Budget * this.Exchange_Rate;
    },
  },
  BRT: {
    type: Number,
    required: true,
    default: function () {
      return this.Budget * 0.02;
    },
  },
  Alternate_BRT: {
    type: Number,
    required: true,
    default: function () {
      return this.Alternate_Budget * 0.02;
    },
  },
  NetAmmount: {
    type: Number,
    required: true,
    default: function () {
      return this.Budget - this.BRT;
    },
  },
  Alternate_NetAmmount: {
    type: Number,
    required: true,
    default: function () {
      return this.Currency === "AFN"
        ? this.NetAmmount / this.Exchange_Rate
        : this.NetAmmount * this.Exchange_Rate;
    },
  },
  Cost: { type: Number, required: true, default: 0 },
  Alternate_Cost: {
    type: Number,
    required: true,
    default: function () {
      return this.Currency === "AFN"
        ? this.Cost / this.Exchange_Rate
        : this.Cost * this.Exchange_Rate;
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
      Cost_Currency: { type: String, required: true, default: "AFN" },
      Cost_USD: {
        type: Number,
        required: true,
        default: function () {
          return this.Cost_Currency == "USD"
            ? this.Ammount
            : this.Ammount / this.Exchange_Rate;
        },
      },
      Cost_AFN: {
        type: Number,
        required: true,
        default: function () {
          return this.Cost_Currency == "AFN"
            ? this.Ammount
            : this.Ammount * this.Exchange_Rate;
        },
      },
      Alternate_Currency: {
        type: String,
        required: true,
        default: function () {
          return this.Cost_Currency === "USD"
            ? "AFN"
            : this.Cost_Currency === "AFN"
            ? "USD"
            : "AFN";
        },
      },
      Alternate_Ammount: {
        type: Number,
        required: true,
        default: function () {
          return this.Cost_Currency === "AFN"
            ? this.Ammount / this.Exchange_Rate
            : this.Ammount * this.Exchange_Rate;
        },
      },
    },
  ],
  Project_Budget: [
    {
      Description: {
        type: String,
        default: `Installment #: 1 (default)`,
      },
      ReceivedBy: {
        Name: { type: String },
        Email: { type: String },
      },
      SubmittedBy: {
        Client_Name: { type: String },
        Client_Email: { type: String },
      },
      Ammount: { type: Number, required: true, default: 0 },
      CreatedAt: { type: Date, required: true, default: Date.now },
      Exchange_Rate: { type: Number, required: true, default: 82.2 },
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
            ? this.Ammount / this.Exchange_Rate
            : this.Ammount * this.Exchange_Rate;
        },
      },
    },
  ],
  Status: { type: String, required: true, default: "In Progress" },
  Revenue: {
    type: Number,
    required: true,
    default: function () {
      return this.NetAmmount - this.Cost;
    },
  },
  Alternate_Revenue: {
    type: Number,
    required: true,
    default: function () {
      return this.Alternate_NetAmmount - this.Alternate_Cost;
    },
  },
  Description: { type: String, required: true },
  File: { type: String },
});

module.exports = mongoose.model("projectModal", projectsSchema);
