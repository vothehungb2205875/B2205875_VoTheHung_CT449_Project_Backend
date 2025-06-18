const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authController = require("../controllers/auth.controller");
const jwt = require("jsonwebtoken");
const uploadAvatar = require("../middlewares/upload");

// Bắt đầu đăng nhập Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Callback sau khi xác thực từ Google
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user) => {
      console.log("user:", user);
      console.log("err:", err);

      if (err || !user) {
        return res
          .status(401)
          .json({ message: "Đăng nhập thất bại", error: err });
      }

      req.user = user;
      next(); // Chuyển tiếp đến middleware tiếp theo
    })(req, res, next);
  },
  authController.handleGoogleCallback // Xử lý callback sau khi xác thực thành công
);

router.get("/me", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

    const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.json(user); // gửi thông tin người dùng đã đăng nhập dạng json
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ", err });
  }
});

router.post(
  "/register",
  uploadAvatar.single("avatar"),
  authController.register
);
router.post("/login", authController.login);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Đã đăng xuất" });
});

module.exports = router;
