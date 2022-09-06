const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountsSchema = new Schema({
  Account_Name: {
    type: String,
    required: true,
    default: "Zippy Link",
  },
  Account_Email: {
    type: String,
    required: true,
    default: "zippylink@zippylink.net",
  },
  Credit: [
    {
      CreditBy: {
        Name: { type: String, required: true, default: "Hazrat Khan" },
        Email: {
          type: String,
          required: true,
          default: "Hazrat.khan@zippylink.net",
        },
      },
      Source: {
        Project_Name: { type: String, required: true, default: "Project Name" },
        Project_Code: { type: String, required: true, default: "PR_000" },
      },
      ReceiveAs: { type: String, required: true, default: "Cash" },
      Ammount: { type: Number, required: true, default: 0 },
      Date: { type: Date, required: true, default: Date.now },
      Currency: { type: String, required: true, default: "USD" },
    },
  ],
  Total_Credit: {
    type: Number,
    required: true,
    default: 0,
  },
  Debit: [
    {
      Person: {
        Name: { type: String, required: true, default: "Hazrat Khan" },
        Email: {
          type: String,
          required: true,
          default: "Hazrat.khan@zippylink.net",
        },
      },
      ReceiveAs: { type: String, required: true, default: "Cash" },
      Ammount: { type: Number, required: true, default: 0 },
      Voucher_Number: { type: String, required: true, default: "000000" },
      Date: { type: Date, required: true, default: Date.now },
      Currency: { type: String, required: true, default: "USD" },
    },
  ],
  Total_Debit: {
    type: Number,
    required: true,
    default: 0,
  },
  Cash_Inhand: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("accountsModal", accountsSchema);
