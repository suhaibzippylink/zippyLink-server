const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employerSchema = new Schema({
  Image: {
    type: String,
    default: "Image Will be selected later",
  },
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Designation: {
    type: String,
    required: true,
  },
  Phone: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  Address: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
  },
  BasicSalary: {
    type: Number,
    required: true,
    default: 0,
  },
  StartDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  SalaryDetails: [
    {
      Date: { type: Date, required: true, default: Date.now },
      Amount: {
        type: Number,
        required: true,
        default: function () {
          return this.BasicSalary;
        },
      },
      Paid: { type: Boolean, required: true, default: false },
    },
  ],
});

module.exports = mongoose.model("employerModal", employerSchema);
