const express = require("express");
const router = express.Router();
const chatbot = require("../controllers/chatbot.controller");

// POST /api/chatbot
router.post("/", chatbot.ask);

module.exports = router;
