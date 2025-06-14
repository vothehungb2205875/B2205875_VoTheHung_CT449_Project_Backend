const jwt = require("jsonwebtoken");
const ReaderService = require("../services/reader.service");

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

    return res.redirect(
      `${process.env.CLIENT_URL}/login/success?token=${token}`
    );
  } catch (error) {
    console.error("Đăng nhập thất bại:", error);
    res.status(500).json({ message: "Đăng nhập thất bại", error });
  }
};
