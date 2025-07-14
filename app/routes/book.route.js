const express = require("express");
const books = require("../controllers/book.controller.js");
const uploadBookCover = require("../middlewares/uploadBookCover");
const isStaff = require("../middlewares/isStaff");
const {
  validateCreateBook,
  validateUpdateBook,
} = require("../validators/book.validator");
const { handleValidationErrors } = require("../middlewares/validate");

const router = express.Router();

// Thêm sách mới (chỉ staff được phép)
router.post(
  "/",
  isStaff,
  uploadBookCover.single("BiaSach"),
  validateCreateBook,
  handleValidationErrors,
  books.create
);

// Lấy tất cả sách
router.get("/", books.findAll);

// Lấy tất cả loại sách, nxb
router.get("/filters", books.getFilters);

// Lấy sách tiêu biểu
router.get("/top", books.findTopViewed);

// Lấy sách theo mã sách (MaSach)
router.get("/ma/:maSach", books.findByMaSach);

// Lấy một sách theo ID
router.get("/:id", books.findOne);

// Cập nhật sách theo ID (chỉ staff)
router.put(
  "/:id",
  isStaff,
  uploadBookCover.single("BiaSach"),
  validateUpdateBook,
  handleValidationErrors,
  books.update
);

// Xoá sách theo ID (chỉ staff)
router.delete("/:id", isStaff, books.delete);

// Xoá tất cả sách (chỉ staff)
router.delete("/", isStaff, books.deleteAll);

module.exports = router;
