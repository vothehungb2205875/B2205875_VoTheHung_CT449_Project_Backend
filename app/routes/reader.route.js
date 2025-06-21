const express = require("express");
const readers = require("../controllers/reader.controller.js");
const deleteReaderAvatar = require("../middlewares/deleteReaderCover");
const uploadAvatar = require("../middlewares/uploadAvatarCover");

const router = express.Router();

// Route: Thêm bạn đọc mới
router.post("/", readers.create);

// Route: Lấy tất cả bạn đọc
router.get("/", readers.findAll);

// Route: Thống kê
router.get("/statistic", readers.statistic);

// Route: Xoá tất cả bạn đọc
router.delete("/", readers.deleteAll);

// Route: Lấy 1 bạn đọc theo ID
router.get("/:id", readers.findOne);

// Route: Cập nhật bạn đọc theo ID
router.put("/:id", uploadAvatar.single("avatar"), readers.update);

// Route: Xoá bạn đọc theo ID
router.delete("/:id", deleteReaderAvatar, readers.delete);

// Xuất router để dùng trong app chính
module.exports = router;
