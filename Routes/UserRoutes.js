const express = require("express");
const mongoose = require("mongoose");
const UsersModal = require("../Modals/UsersModal");
const usersModal = require("../Modals/UsersModal");
const jwt = require("jsonwebtoken");
const { jwtkey } = require("../Keys/Keys");
const router = express.Router();

router.get("/allUsers", async (req, res) => {
  const allUsers = await usersModal.find();
  res.send({ message: "Users will be displayed...", All_Users: allUsers });
});

router.post("/sign-up", async (req, res) => {
  const {
    Name,
    Email,
    Designation,
    Phone,
    Gender,
    Password,
    rePassword,
    Role,
  } = req.body;
  console.log("Body: ", req.body);
  try {
    const newUser = await usersModal({
      Name,
      Email,
      Designation,
      Phone,
      Gender,
      Password,
      rePassword,
      Role,
    });

    await newUser.save();
    res.send({ message: "User Registered Successfully!!!", New_User: newUser });
  } catch (error) {
    res.send({ error });
  }
});

router.post("/sign-in", async (req, res) => {
  const { Email, Password } = req.body;
  console.log(req.body);
  const loggedUser = await UsersModal.findOne({ Email, Password });
  if (loggedUser) res.send({ message: "logged in Successfully!", loggedUser });
  else res.send({ error: "Invalid Email or Password" });
});

//Login Validation from the database
router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;
  console.log(req.body);
  if (!Email || !Password)
    return res.send({ error: "You must Provide Email & Password" });
  const user = await UsersModal.findOne({ Email });
  if (!user) return res.send({ error: "User with this email does not exists" });
  try {
    await user.comparePassword(Password);
    const token = jwt.sign(
      {
        userID: user._id,
        Name: user.Name,
        Email: user.Email,
        Designation: user.Designation,
        Phone: user.Phone,
        Role: user.Role,
      },
      jwtkey
    );
    res.send({ message: "Logged in Successfully", token });
  } catch (error) {
    res.send({ error: "Invalid Email or Password" });
  }
});

module.exports = router;
