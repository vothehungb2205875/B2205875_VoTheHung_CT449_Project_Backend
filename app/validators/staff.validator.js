const { body } = require("express-validator");

exports.validateCreateStaff = [
  body("HoTenNV")
    .trim()
    .notEmpty()
    .withMessage("Họ tên không được để trống.")
    .matches(/^[A-Za-zÀ-ỹ\s]+$/u)
    .withMessage("Họ tên không hợp lệ (chỉ chữ và khoảng trắng)."),

  body("ChucVu").notEmpty().withMessage("Chức vụ không được để trống."),

  body("DiaChi").notEmpty().withMessage("Địa chỉ không được để trống."),

  body("SoDienThoai")
    .matches(/^[0-9]{9,11}$/)
    .withMessage("Số điện thoại không hợp lệ (9–11 chữ số)."),

  body("email").isEmail().withMessage("Email không hợp lệ."),

  body("Password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc.")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự."),
];

exports.validateUpdateStaff = [
  body("HoTenNV")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Họ tên không được để trống.")
    .matches(/^[A-Za-zÀ-ỹ\s]+$/u)
    .withMessage("Họ tên không hợp lệ (chỉ chữ và khoảng trắng)."),

  body("ChucVu")
    .optional()
    .notEmpty()
    .withMessage("Chức vụ không được để trống."),

  body("DiaChi")
    .optional()
    .notEmpty()
    .withMessage("Địa chỉ không được để trống."),

  body("SoDienThoai")
    .optional()
    .matches(/^[0-9]{9,11}$/)
    .withMessage("Số điện thoại không hợp lệ (9–11 chữ số)."),

  body("email").optional().isEmail().withMessage("Email không hợp lệ."),

  body("Password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự."),
];
