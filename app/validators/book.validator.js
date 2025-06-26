const { body } = require("express-validator");

// Dành cho tạo sách mới
exports.validateCreateBook = [
  body("TenSach")
    .notEmpty()
    .withMessage("Tên sách là bắt buộc.")
    .isLength({ min: 2 })
    .withMessage("Tên sách phải ít nhất 2 ký tự."),

  body("TacGia").notEmpty().withMessage("Tác giả là bắt buộc."),

  body("TheLoai").notEmpty().withMessage("Thể loại là bắt buộc."),

  body("MaNXB").notEmpty().withMessage("Nhà xuất bản là bắt buộc."),

  body("DonGia")
    .notEmpty()
    .withMessage("Đơn giá là bắt buộc.")
    .isFloat({ min: 0 })
    .withMessage("Đơn giá phải là số không âm."),

  body("SoQuyen")
    .notEmpty()
    .withMessage("Số quyển là bắt buộc.")
    .isInt({ min: 1 })
    .withMessage("Số quyển phải lớn hơn 0."),

  body("NamXuatBan")
    .notEmpty()
    .withMessage("Năm xuất bản là bắt buộc.")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("Năm xuất bản không hợp lệ."),
];

// Dành cho cập nhật sách (chỉ validate nếu trường tồn tại)
exports.validateUpdateBook = [
  body("TenSach")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Tên sách phải ít nhất 2 ký tự."),

  body("TacGia")
    .optional()
    .notEmpty()
    .withMessage("Tác giả không được để trống."),

  body("TheLoai")
    .optional()
    .notEmpty()
    .withMessage("Thể loại không được để trống."),

  body("MaNXB")
    .optional()
    .notEmpty()
    .withMessage("Nhà xuất bản không được để trống."),

  body("DonGia")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Đơn giá phải là số không âm."),

  body("SoQuyen")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Số quyển phải lớn hơn 0."),

  body("NamXuatBan")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("Năm xuất bản không hợp lệ."),

  body("TrangThai")
    .optional()
    .isIn(["Đã xóa", "Hoạt động"])
    .withMessage("Trạng thái không hợp lệ."),
];
