const express = require("express");
const router = express.Router();
const mailController = require("../controllers/mail.controller");

router.post("/reminder", mailController.sendReminder);

module.exports = router;
