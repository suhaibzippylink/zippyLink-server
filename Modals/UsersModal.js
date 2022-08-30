const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
  Gender: {
    type: String,
  },
  Password: {
    type: String,
    required: true,
  },
  rePassword: {
    type: String,
    required: true,
  },
  Verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  Role: {
    type: String,
  },
});

module.exports = mongoose.model("userModal", userSchema);
