const express = require("express");
const readers = require("../controllers/reader.controller.js");

const router = express.Router();

// Route: Thêm bạn đọc mới
router.post("/", readers.create);

// Route: Lấy tất cả bạn đọc
router.get("/", readers.findAll);

// Route: Lấy 1 bạn đọc theo ID
router.get("/:id", readers.findOne);

// Route: Cập nhật bạn đọc theo ID
router.put("/:id", readers.update);

// Route: Xoá bạn đọc theo ID
router.delete("/:id", readers.delete);

// Route: Xoá tất cả bạn đọc
router.delete("/", readers.deleteAll);

// Xuất router để dùng trong app chính
module.exports = router;
