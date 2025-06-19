const fs = require("fs");
const path = require("path");
const ReaderService = require("../services/reader.service");
const MongoDB = require("../utils/mongodb.util");

async function deleteReaderAvatar(req, res, next) {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const reader = await readerService.findById(req.params.id);

    if (!reader) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy độc giả để xoá ảnh" });
    }

    if (reader.avatar && reader.avatar !== "uploads/avatars/default.jpg") {
      const filePath = path.join(__dirname, "../", reader.avatar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    next(); // tiếp tục tới controller xoá độc giả
  } catch (err) {
    console.error("Lỗi middleware xóa avatar:", err);
    return res.status(500).json({ message: "Lỗi khi xóa ảnh đại diện" });
  }
}

module.exports = deleteReaderAvatar;
