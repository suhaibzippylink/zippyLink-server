const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Year_Since_Working: {
    type: Number,
    required: true,
    default: 0,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  Projects: [
    {
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
      Project_Title: {
        type: String,
        required: true,
      },
      Project_Nature: {
        type: String,
        required: true,
      },
      Budget: {
        type: Number,
        Required: true,
        default: 0,
      },
      Cost: {
        type: Number,
        Required: true,
        default: 0,
      },
    },
  ],
  Address: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});
module.exports = mongoose.model("customerModal", customerSchema);
