const jwt = require("jsonwebtoken");
const ReaderService = require("../services/reader.service");
const bcrypt = require("bcryptjs");
const ApiError = require("../api-error");
const StaffService = require("../services/staff.service");

exports.handleGoogleCallback = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    req.user.MaDocGia = "DG" + Date.now(); // Tự động sinh mã độc giả
    req.user.createdAt = new Date();
    const readerService = new ReaderService(req.app.locals.dbClient);
    const user = await readerService.createOrFindByGoogle(req.user);

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        MaDocGia: user.MaDocGia,
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
  const { HoLot, Ten, email, MatKhau, NgaySinh, Phai, DiaChi, DienThoai } =
    req.body;

  // Kiểm tra các trường bắt buộc
  const requiredFields = {
    HoLot,
    Ten,
    email,
    MatKhau,
    NgaySinh,
    Phai,
    DiaChi,
    DienThoai,
  };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return next(new ApiError(400, `Thiếu trường bắt buộc: ${key}`));
    }
  }

  try {
    const readerService = new ReaderService(req.app.locals.dbClient);

    // Kiểm tra email đã tồn tại chưa
    const existed = await readerService.find({ email });
    if (existed.length > 0) {
      return next(new ApiError(409, "Email đã tồn tại"));
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(MatKhau, 10);

    // Sinh mã độc giả
    const MaDocGia = "DG" + Date.now();

    // Xử lý avatar
    const avatarFile = req.file;
    const avatarPath = avatarFile
      ? `uploads/avatars/${avatarFile.filename}`
      : "uploads/avatars/default.jpg";

    // Tạo payload đầy đủ để lưu vào DB
    const payload = {
      HoLot,
      Ten,
      email,
      MatKhau: hashedPassword,
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      MaDocGia,
      name: `${HoLot} ${Ten}`,
      provider: "local",
      avatar: avatarPath,
      createdAt: new Date(),
    };

    const result = await readerService.create(payload);

    const createdReader = await readerService.findById(result.insertedId);

    return res.status(201).json(createdReader);
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản:", error);
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
    const staffService = new StaffService(req.app.locals.dbClient);

    let user = null;
    let role = null;

    // Ưu tiên kiểm tra nhân viên trước
    const staff = await staffService.find({ email }); // tìm theo email
    if (staff.length > 0) {
      const staffUser = staff[0];
      const isMatch = await bcrypt.compare(MatKhau, staffUser.Password);

      if (!isMatch) {
        return next(new ApiError(401, "Email hoặc mật khẩu không đúng"));
      }

      user = staffUser;
      role = "staff";
    } else {
      // Nếu không phải nhân viên, kiểm tra độc giả
      const readers = await readerService.find({ email, provider: "local" });
      if (readers.length === 0) {
        return next(new ApiError(401, "Email hoặc mật khẩu không đúng"));
      }

      const readerUser = readers[0];
      const isMatch = await bcrypt.compare(MatKhau, readerUser.MatKhau);

      if (!isMatch) {
        return next(new ApiError(401, "Email hoặc mật khẩu không đúng"));
      }

      user = readerUser;
      role = "reader";
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name || user.HoTenNV,
        avatar: user.avatar,
        MaDocGia: user.MaDocGia,
        role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Gửi cookie
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
        name: user.name || user.HoTenNV,
        email: user.email,
        avatar: user.avatar,
        MaDocGia: user.MaDocGia,
        role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return next(new ApiError(500, "Lỗi đăng nhập"));
  }
};
