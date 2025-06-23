const { body } = require("express-validator");

const borrowValidationRules = [
  body("MaSach").notEmpty().withMessage("Mã sách là bắt buộc"),

  body("NgayMuon")
    .notEmpty()
    .withMessage("Ngày mượn là bắt buộc")
    .isISO8601()
    .toDate()
    .withMessage("Ngày mượn không hợp lệ")
    .custom((value) => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);

      const d = new Date(value);
      const yyyyMMdd = (date) => date.toISOString().split("T")[0];

      if (yyyyMMdd(d) !== yyyyMMdd(now) && yyyyMMdd(d) !== yyyyMMdd(tomorrow)) {
        throw new Error("Ngày mượn phải là hôm nay hoặc ngày mai");
      }

      return true;
    }),

  body("NgayTra")
    .notEmpty()
    .withMessage("Ngày trả là bắt buộc")
    .isISO8601()
    .toDate()
    .withMessage("Ngày trả không hợp lệ")
    .custom((value, { req }) => {
      const ngayMuon = new Date(req.body.NgayMuon);
      const ngayTra = new Date(value);

      if (ngayTra < ngayMuon) {
        throw new Error("Ngày trả phải sau hoặc bằng ngày mượn");
      }

      const maxReturn = new Date(ngayMuon);
      maxReturn.setDate(ngayMuon.getDate() + 7);

      if (ngayTra > maxReturn) {
        throw new Error("Ngày trả không được quá 7 ngày sau ngày mượn");
      }

      return true;
    }),
];

module.exports = borrowValidationRules;
