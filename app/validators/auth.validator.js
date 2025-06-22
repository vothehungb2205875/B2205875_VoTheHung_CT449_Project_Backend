const { body } = require("express-validator");

exports.validateRegister = [
  body("HoLot")
    .trim()
    .notEmpty()
    .withMessage("Họ lót là bắt buộc.")
    .matches(/^[A-Za-zÀ-ỹ\s]+$/u)
    .withMessage("Họ lót không được chứa số hoặc ký tự đặc biệt."),

  body("Ten")
    .trim()
    .notEmpty()
    .withMessage("Tên là bắt buộc.")
    .matches(/^[A-Za-zÀ-ỹ\s]+$/u)
    .withMessage("Tên không được chứa số hoặc ký tự đặc biệt."),

  body("email").isEmail().withMessage("Email không hợp lệ."),

  body("MatKhau")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự."),

  body("NgaySinh")
    .isDate()
    .withMessage("Ngày sinh không hợp lệ.")
    .custom((value) => {
      const now = new Date().toISOString().split("T")[0];
      if (value > now) {
        throw new Error("Ngày sinh không được là tương lai.");
      }
      return true;
    }),

  body("Phai")
    .isIn(["Nam", "Nữ"])
    .withMessage("Giới tính phải là 'Nam' hoặc 'Nữ'."),

  body("DiaChi").notEmpty().withMessage("Địa chỉ là bắt buộc."),

  body("DienThoai")
    .matches(/^[0-9]{9,11}$/)
    .withMessage("Số điện thoại không hợp lệ (chỉ 9–11 số)."),
];
