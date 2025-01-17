const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { v4 } = require("uuid");

const { User, schemas } = require("../../models/user");
const { sendMail } = require("../../helpers");

const router = express.Router();

const { SECRET_KEY } = process.env;

router.post("/register", async (req, res, next) => {
  try {
    const { error } = schemas.register.validate(req.body);
    if (error) {
      res.status(400).json({ message: ` ${error.message}` });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      res.status(409).json({ message: `Email in use` });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = v4();
    await User.create({
      email,
      avatarURL,
      password: hashPassword,
      verificationToken,
    });
    const mail = {
      to: email,
      subject: "Подтверждение email",
      html: `<a target="_blank" href='localhost:3000/api/users/${verificationToken}'>Нажмите чтобы подтвердить свой email </a>`,
    };
    await sendMail(mail);
    res.status(201).json({
      user: {
        email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = schemas.register.validate(req.body);
    if (error) {
      res.status(400).json({ message: ` ${error.message}` });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: `Email or password is wrong` });
    }
    if (!user.verify) {
      res.status(401).json({ message: `Email is not verified` });
    }
    const compareResult = await bcrypt.compare(password, user.password);
    if (!compareResult) {
      res.status(401).json({ message: `Email or password is wrong` });
    }
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        email,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
