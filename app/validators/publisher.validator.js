const { body } = require("express-validator");

const validateCreatePublisher = [
  body("MaNXB")
    .notEmpty()
    .withMessage("Mã NXB là bắt buộc.")
    .isLength({ min: 2 })
    .withMessage("Mã NXB phải có ít nhất 2 ký tự."),

  body("TenNXB")
    .notEmpty()
    .withMessage("Tên NXB là bắt buộc.")
    .isLength({ min: 2 })
    .withMessage("Tên NXB phải có ít nhất 2 ký tự."),

  body("DiaChi")
    .notEmpty()
    .withMessage("Địa chỉ là bắt buộc.")
    .isLength({ min: 5 })
    .withMessage("Địa chỉ phải ít nhất 5 ký tự."),
];

module.exports = {
  validateCreatePublisher,
  validateUpdatePublisher: validateCreatePublisher, // dùng chung
};
