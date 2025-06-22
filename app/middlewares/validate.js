const { validationResult } = require("express-validator");

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array()[0].msg; // chỉ trả về lỗi đầu tiên
    return res.status(400).json({ message: errorMsg });
  }
  next();
};
