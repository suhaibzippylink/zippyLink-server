const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
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

//hashing the Password using hash method
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("Password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next();
    bcrypt.hash(user.Password, salt, (err, hash) => {
      if (err) return next(err);
      user.Password = hash;
      user.rePassword = hash;
      next();
    });
  });
});

//Comaring the Password with the one which is hashed
userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.Password, (err, isMatch) => {
      if (err) return reject(err);
      if (!isMatch) return reject(err);
      resolve(true);
    });
  });
};
module.exports = mongoose.model("userModal", userSchema);
