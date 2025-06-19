const express = require("express");
const books = require("../controllers/book.controller.js");
const uploadBookCover = require("../middlewares/uploadBookCover");
const deleteBookCover = require("../middlewares/deleteBookCover");
const isStaff = require("../middlewares/isStaff");

const router = express.Router();

// Thêm sách mới (chỉ staff được phép)
router.post("/", isStaff, uploadBookCover.single("BiaSach"), books.create);

// Route: Lấy tất cả sách
router.get("/", books.findAll);

// Route: Lấy sách tiêu biểu (top viewed)
router.get("/top", books.findTopViewed);

// Route: Lấy 1 sách theo ID
router.get("/:id", books.findOne);

// Cập nhật sách theo ID
router.put("/:id", isStaff, uploadBookCover.single("BiaSach"), books.update);

// Xoá sách theo ID
router.delete("/:id", isStaff, deleteBookCover, books.delete);

// Xoá tất cả sách
router.delete("/", isStaff, books.deleteAll);

// Xuất router để dùng trong app chính
module.exports = router;
