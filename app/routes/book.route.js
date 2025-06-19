const express = require("express");
const books = require("../controllers/book.controller.js");
const uploadBookCover = require("../middlewares/uploadBookCover");
const deleteBookCover = require("../middlewares/deleteBookCover");
const updateBookCover = require("../middlewares/updateBookCover");

const router = express.Router();

// Route: Thêm sách mới
router.post("/", uploadBookCover.single("BiaSach"), books.create);

// Route: Lấy tất cả sách
router.get("/", books.findAll);

// Route: Lấy sách tiêu biểu (top viewed)
router.get("/top", books.findTopViewed);

// Route: Lấy 1 sách theo ID
router.get("/:id", books.findOne);

// Route: Cập nhật sách theo ID
router.put("/:id", uploadBookCover.single("BiaSach"), books.update);

// Route: Xoá sách theo ID
router.delete("/:id", deleteBookCover, books.delete);

// Route: Xoá tất cả sách
router.delete("/", books.deleteAll);

// Xuất router để dùng trong app chính
module.exports = router;
