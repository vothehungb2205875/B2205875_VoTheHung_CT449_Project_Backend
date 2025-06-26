const express = require("express");
const publishers = require("../controllers/publisher.controller.js");
const {
  validateCreatePublisher,
  validateUpdatePublisher,
} = require("../validators/publisher.validator");
const { handleValidationErrors } = require("../middlewares/validate");

const router = express.Router();

// Route: Thêm nhà xuất bản mới
router.post(
  "/",
  validateCreatePublisher,
  handleValidationErrors,
  publishers.create
);

// Route: Lấy tất cả nhà xuất bản
router.get("/", publishers.findAll);

// Route: Lấy 1 nhà xuất bản theo ID
router.get("/:id", publishers.findOne);

// Route: Cập nhật nhà xuất bản theo ID
router.put(
  "/:id",
  validateUpdatePublisher,
  handleValidationErrors,
  publishers.update
);

// Route: Xoá nhà xuất bản theo ID
router.delete("/:id", publishers.delete);

// Route: Xoá tất cả nhà xuất bản
router.delete("/", publishers.deleteAll);

// Xuất router để dùng trong app chính
module.exports = router;
