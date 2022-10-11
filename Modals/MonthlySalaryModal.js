const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const monthlySalarySchema = new Schema({
  Month: {
    type: String,
    required: true,
  },
  CreatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  Employers: [
    {
      Name: {
        type: String,
        required: true,
        default: "",
      },
      Email: {
        type: String,
        required: true,
        default: "example@gmail.com",
      },
      Working_Days: {
        type: Number,
        required: true,
        default: 30,
      },
      AdvancePay: {
        type: Number,
        required: true,
        default: 0,
      },
      Basic_Salary: {
        type: Number,
        required: true,
        default: 0,
      },
      Calculated_Salary: {
        type: Number,
        required: true,
        default: function () {
          return Math.round((this.Basic_Salary / 30) * this.Working_Days);
        },
      },
      TAX: {
        type: Number,
        required: true,
        default: 0,
      },
      Net_Salary: {
        type: Number,
        required: true,
        default: function () {
          return Math.round(
            this.Calculated_Salary - this.TAX - this.AdvancePay
          );
        },
      },
      Paid: {
        type: Boolean,
        required: true,
        default: false,
      },
      PaidAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  PaidSalaries: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("monthlySalaryModal", monthlySalarySchema);
