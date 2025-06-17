const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không có token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
}

module.exports = verifyToken;
