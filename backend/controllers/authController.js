const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
    const { name, email, password, role, cin, diploma, rating } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({message: "User already exists"})

        const user = await User.create({name, email, password, role, cin, diploma, rating});
        res.status(201).json({
            message: "User registered successfully",
        });
    } catch (err) {
        res.status(500).json({error: err.message})
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const isExist = await User.findOne({ email });
      if (!isExist) return res.status(400).json({ message: "Email or password is incorrect. Please try again." });
  
      const isMatch = await bcrypt.compare(password, isExist.password);
      if (!isMatch) return res.status(400).json({ message: "Email or password is incorrect. Please try again." });
  
      const token = generateToken(isExist._id);
  
      res.status(200).json({
        message: "Logged in successfully",
        token,
        user: {
          id: isExist._id,
          name: isExist.name,
          email: isExist.email,
          role: isExist.role,
          cin: isExist.cin,
          diploma: isExist.diploma
        },
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  };