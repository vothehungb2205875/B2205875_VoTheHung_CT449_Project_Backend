// middlewares/deleteBookCover.js
const fs = require("fs");
const path = require("path");
const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");

async function deleteBookCover(req, res, next) {
  try {
    const bookService = new BookService(MongoDB.client);
    const book = await bookService.findById(req.params.id);

    if (!book) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sách để xóa ảnh" });
    }

    if (book.BiaSach) {
      const filePath = path.join(__dirname, "../", book.BiaSach);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    next(); // tiếp tục tới controller delete
  } catch (err) {
    console.error("Lỗi middleware xóa ảnh:", err);
    return res.status(500).json({ message: "Lỗi khi xóa ảnh bìa" });
  }
}

module.exports = deleteBookCover;
