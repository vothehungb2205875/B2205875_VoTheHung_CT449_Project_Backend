const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "staff") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    req.user = decoded; // gắn user vào req nếu muốn dùng tiếp
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ", error: err });
  }
};
