const express = require("express");
const path = require("path");
const { User, schemas } = require("../../models/user");
const fs = require("fs/promises");
const { authenticate, upload } = require("../../middlewares");
// eslint-disable-next-line no-unused-vars
const Joi = require("joi");
const { sendMail } = require("../../helpers");

const router = express.Router();

router.get("/verify/:verificationtoken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne(verificationToken);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    });
    res.json({ message: "verification successful" });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { error } = schemas.verify.validate(req.body);
    if (error) {
      res.status(400).json({ message: "missing required field email" });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user.verify) {
      res.status(400).json({ message: "Verification has a;ready been passed" });
    }
    const mail = {
      to: email,
      subject: "Подтверждение email",
      html: `<a target="_blank" href='localhost:3000/api/users/${user.verificationToken}'>Нажмите чтобы подтвердить свой email </a>`,
    };
    sendMail(mail);
    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/current", authenticate, async (req, res, next) => {
  res.json({
    email: req.user.email,
  });
});

router.get("/logout", authenticate, async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).send();
});

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    const { _id } = req.user;
    const { path: tempUpload, filename } = req.file;

    try {
      const [extention] = filename.split(".").reverse();
      const newFileName = `${_id}.${extention}`;
      const resultUpload = path.join(avatarsDir, newFileName);
      await fs.rename(tempUpload, resultUpload);
      const avatarURL = path.join("avatars", newFileName);
      await User.findByIdAndUpdate(_id, { avatarURL });
      res.json({
        avatarURL,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
