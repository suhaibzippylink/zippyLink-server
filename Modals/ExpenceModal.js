const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const expenceSchema = new Schema({
  Month: {
    type: String,
    required: true,
  },
  CreatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  TotalExpences: {
    type: Number,
    default: 0,
  },
  Expences: [
    {
      Exp_Code: {
        type: String,
        required: true,
      },
      Exp_Title: {
        type: String,
      },
      Date: {
        type: Date,
        default: Date.now,
        required: true,
      },
      Voucher_Number: {
        type: String,
        required: true,
        default: "000000",
      },
      Item: {
        type: String,
        required: true,
      },
      Cost: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("expenceModal", expenceSchema);
