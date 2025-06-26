const express = require("express");
const readers = require("../controllers/reader.controller.js");
const uploadAvatar = require("../middlewares/uploadAvatarCover");
const { validateUpdateProfile } = require("../validators/reader.validator");
const { handleValidationErrors } = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const isStaff = require("../middlewares/isStaff");

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
router.put(
  "/:id",
  verifyToken,
  uploadAvatar.single("avatar"),
  validateUpdateProfile,
  handleValidationErrors,
  readers.update
);

// Route: Xoá bạn đọc theo ID
router.delete("/:id", isStaff, readers.delete);

// Tìm theo mã
router.get("/ma/:MaDocGia", readers.findByMa);

// Xuất router để dùng trong app chính
module.exports = router;
