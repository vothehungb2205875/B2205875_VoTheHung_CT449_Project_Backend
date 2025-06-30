module.exports = (req, res, next) => {
  // Giả sử đã qua middleware xác thực staff trước đó
  if (req.user?.ChucVu !== "Quản lý") {
    return res
      .status(403)
      .json({ message: "Chỉ Quản lý mới được phép thực hiện thao tác này." });
  }
  next();
};
