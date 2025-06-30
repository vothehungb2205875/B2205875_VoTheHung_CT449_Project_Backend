const express = require("express");
const readers = require("../controllers/reader.controller.js");
const uploadAvatar = require("../middlewares/uploadAvatarCover");
const { validateUpdateProfile } = require("../validators/reader.validator");
const { handleValidationErrors } = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const isStaff = require("../middlewares/isStaff");

const router = express.Router();

// Route: Thêm bạn đọc mới
router.post("/", readers.create); // Public – bạn đọc có thể tự đăng ký

// Route: Lấy tất cả bạn đọc (chỉ staff được xem toàn bộ)
router.get("/", isStaff, readers.findAll);

// Route: Thống kê – chỉ staff
router.get("/statistic", readers.statistic);

// Route: Xoá tất cả bạn đọc – chỉ staff
router.delete("/", isStaff, readers.deleteAll);

// Route: Lấy 1 bạn đọc theo ID – yêu cầu đăng nhập (độc giả hoặc nhân viên)
router.get("/:id", verifyToken, readers.findOne);

// Route: Cập nhật bạn đọc theo ID – yêu cầu đăng nhập
router.put(
  "/:id",
  verifyToken,
  uploadAvatar.single("avatar"),
  validateUpdateProfile,
  handleValidationErrors,
  readers.update
);

// Route: Xoá 1 bạn đọc – chỉ staff
router.delete("/:id", isStaff, readers.delete);

// Route: Tìm độc giả theo mã – chỉ staff
router.get("/ma/:MaDocGia", isStaff, readers.findByMa);

module.exports = router;
