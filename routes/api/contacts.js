const express = require("express");
const Joi = require("joi");
const contacts = require("../../models/contacts.js");

const router = express.Router();

const joiSchema = Joi.object({
  name: Joi.string().min(4).required(),
  email: Joi.string().email().required(),
  phone: Joi.number().required(),
});

router.get("/", async (req, res, next) => {
  try {
    const result = await contacts.listContacts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contacts.getContactById(contactId);
    if (!result) {
      res.status(404).json({
        message: "Not found",
      });
      return;
    }
    res.json(result);
  } catch (error) {
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
    const result = await contacts.addContact(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.log("error: ", error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const result = await contacts.removeContact(contactId);
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
    const result = await contacts.updateContact(contactId, req.body);
    if (!result) {
      res.status(404).json({ message: `error! no such id! ${contactId}` });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: `Not found ${error}` });
  }
});

module.exports = router;
