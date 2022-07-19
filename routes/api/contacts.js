const express = require("express");
const Joi = require("joi");

const { Contact } = require("../../models/contact");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await Contact.find({}, "-__v");
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: `Server error ${error}` });
  }
});

const joiSchema = Joi.object({
  name: Joi.string().min(4).required(),
  email: Joi.string().email().required(),
  phone: Joi.number().required(),
  favorite: Joi.boolean().required(),
});
const joiSchemaPatchFavorite = Joi.object({
  favorite: Joi.boolean().required(),
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);
    if (!result) {
      res.status(404).json({
        message: "Not found",
      });
      return;
    }
    res.json(result);
  } catch (error) {
    if (error.message.includes("Cast to Object failed")) {
      error.status = 404;
    }
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: `missing required name field ${error}` });
    }
    const result = await Contact.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.log("error: ", error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndDelete(contactId);
  if (!result) {
    res.status(404).json({ message: "Not found" });
  }
  res.status(200).json({ message: "contact deleted" });
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: `missing fields ${error}` });
    }
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!result) {
      res.status(404).json({ message: `error! no such id! ${contactId}` });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: `Not found ${error}` });
  }
});

router.patch("/:contactId/active", async (req, res, next) => {
  try {
    const { error } = joiSchemaPatchFavorite.validate(req.body);
    if (error) {
      res.status(400).json({ message: `missing fields ${error}` });
    }
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!result) {
      res.status(404).json({ message: `error! no such id! ${contactId}` });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: `Not found ${error}` });
  }
});

module.exports = router;
