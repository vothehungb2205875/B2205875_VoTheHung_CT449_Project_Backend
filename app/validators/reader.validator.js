const { body } = require("express-validator");

exports.validateUpdateProfile = [
  body("HoLot")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Họ lót không được để trống.")
    .matches(/^[A-Za-zÀ-ỹ\s]+$/u)
    .withMessage("Họ lót không hợp lệ (chỉ chữ và khoảng trắng)."),

  body("Ten")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên không được để trống.")
    .matches(/^[A-Za-zÀ-ỹ\s]+$/u)
    .withMessage("Tên không hợp lệ (chỉ chữ và khoảng trắng)."),

  body("NgaySinh")
    .optional()
    .isISO8601()
    .withMessage("Ngày sinh không hợp lệ.")
    .custom((value) => {
      const today = new Date().toISOString().split("T")[0];
      if (value > today) {
        throw new Error("Ngày sinh không được là tương lai.");
      }
      return true;
    }),

  body("Phai")
    .optional()
    .isIn(["Nam", "Nữ"])
    .withMessage("Giới tính phải là 'Nam' hoặc 'Nữ'."),

  body("DiaChi")
    .optional()
    .notEmpty()
    .withMessage("Địa chỉ không được để trống."),

  body("DienThoai")
    .optional()
    .matches(/^[0-9]{9,11}$/)
    .withMessage("Số điện thoại không hợp lệ (9–11 số)."),
];
