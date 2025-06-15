const jwt = require("jsonwebtoken");
const ReaderService = require("../services/reader.service");
const bcrypt = require("bcryptjs");
const ApiError = require("../api-error");

exports.handleGoogleCallback = async (req, res) => {
  try {
    console.log("req.user:", req.user);

    const readerService = new ReaderService(req.app.locals.dbClient);
    const user = await readerService.createOrFindByGoogle(req.user);

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // bảo vệ ở môi trường thực tế
      sameSite: "Lax", // ngăn CSRF phần nào
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });

    return res.redirect(`${process.env.CLIENT_URL}/login/success`);
  } catch (error) {
    console.error("Đăng nhập thất bại:", error);
    res.status(500).json({ message: "Đăng nhập thất bại", error });
  }
};

exports.register = async (req, res, next) => {
  const requiredFields = [
    "HoLot",
    "Ten",
    "email",
    "MatKhau",
    "NgaySinh",
    "Phai",
    "DiaChi",
    "DienThoai",
  ];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new ApiError(400, `Thiếu trường bắt buộc: ${field}`));
    }
  }

  try {
    const readerService = new ReaderService(req.app.locals.dbClient);

    const existed = await readerService.find({ email: req.body.email });
    if (existed.length > 0) {
      return next(new ApiError(409, "Email đã tồn tại"));
    }

    const hashed = await bcrypt.hash(req.body.MatKhau, 10);
    const MaDocGia = "DG" + Date.now(); // Tự động sinh mã độc giả

    // ✅ XỬ LÝ AVATAR
    const avatarFile = req.file;
    const avatarPath = avatarFile
      ? `/uploads/avatars/${avatarFile.filename}`
      : `/uploads/avatars/default.jpg`;

    const payload = {
      ...req.body,
      name: `${req.body.HoLot} ${req.body.Ten}`,
      MatKhau: hashed,
      MaDocGia,
      provider: "local",
      avatar: avatarPath,
    };

    const result = await readerService.create(payload);
    return res.status(201).json({
      message: "Tạo tài khoản thành công",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi tạo tài khoản"));
  }
};

exports.login = async (req, res, next) => {
  const { email, MatKhau } = req.body;

  if (!email || !MatKhau) {
    return next(new ApiError(400, "Vui lòng nhập email và mật khẩu"));
  }

  try {
    const readerService = new ReaderService(req.app.locals.dbClient);

    // Tìm người dùng theo email và provider = "local"
    const users = await readerService.find({ email, provider: "local" });
    const user = users[0];

    if (!user) {
      return next(new ApiError(401, "Email hoặc mật khẩu không đúng"));
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
    if (!isMatch) {
      return next(new ApiError(401, "Email hoặc mật khẩu không đúng"));
    }

    // Tạo token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "reader",
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Đăng nhập lỗi:", error);
    return next(new ApiError(500, "Lỗi đăng nhập"));
  }
};
