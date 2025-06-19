const fs = require("fs");
const path = require("path");
const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

module.exports = async function handleBookCoverUpdate(req, res, next) {
  try {
    const id = req.params.id;

    if (!req.file) return next(); // Nếu không có ảnh mới → bỏ qua

    const bookService = new BookService(MongoDB.client);
    const oldBook = await bookService.findById(id);

    if (!oldBook) {
      return next(new ApiError(404, "Không tìm thấy sách với ID: " + id));
    }

    // Nếu có ảnh cũ → xoá ảnh cũ
    if (oldBook.BiaSach) {
      const oldPath = path.join(__dirname, "../", oldBook.BiaSach);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Gán đường dẫn ảnh mới vào req.body
    req.body.BiaSach = `uploads/books/${req.file.filename}`;
    next();
  } catch (err) {
    console.error("Lỗi khi xử lý ảnh bìa:", err);
    return next(new ApiError(500, "Lỗi khi xử lý ảnh bìa"));
  }
};
