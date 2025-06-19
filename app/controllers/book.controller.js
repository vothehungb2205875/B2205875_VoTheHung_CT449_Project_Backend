const MongoDB = require("../utils/mongodb.util");
const BookService = require("../services/book.service");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  let data = req.body;

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return next(new ApiError(400, "Dữ liệu sách không được rỗng"));
  }

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return next(new ApiError(400, "Dữ liệu không hợp lệ"));
    }
  }

  if (!data.MaSach && data.TenSach) {
    const letters = data.TenSach.split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word[0].toUpperCase())
      .join("");
    const unique = Date.now().toString().slice(-4);
    data.MaSach = letters + unique;
  }

  const fieldsToCheck = [
    "TacGia",
    "TheLoai",
    "NamXuatBan",
    "DonGia",
    "SoQuyen",
  ];
  fieldsToCheck.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      data[field] = "Chờ cập nhật";
    }
  });

  if (req.file) {
    data.BiaSach = `uploads/books/${req.file.filename}`;
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const insertedBook = await bookService.create(data);
    return res.status(201).json(insertedBook);
  } catch (err) {
    console.error("Lỗi khi thêm sách:", err);
    return next(new ApiError(500, "Lỗi khi thêm sách"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const { q, genre } = req.query;

    let filter = {};
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (q && genre) {
      filter = {
        TheLoai: genre,
        TenSach: { $regex: escapeRegex(q), $options: "i" },
      };
    } else if (q) {
      filter.TenSach = { $regex: escapeRegex(q), $options: "i" };
    } else if (genre) {
      filter.TheLoai = genre;
    }

    const bookService = new BookService(MongoDB.client);
    const documents = await bookService.find(filter);
    res.send(documents);
  } catch (err) {
    next(new ApiError(500, "Lỗi tìm sách"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.findById(req.params.id);
    const id = req.params.id;
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy sách với ID: " + req.params.id)
      );
    }
    // Tăng lượt xem
    const updated = await bookService.update(id, {
      LuotXem: (document.LuotXem || 0) + 1,
    });
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy sách với ID: " + req.params.id));
  }
};

exports.findTopViewed = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const books = await bookService.findTopViewed();
    return res.send(books);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi truy xuất sách tiêu biểu"));
  }
};

const fs = require("fs");
const path = require("path");

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };

    const bookService = new BookService(MongoDB.client);
    const oldBook = await bookService.findById(id);

    if (!oldBook) {
      return next(new ApiError(404, "Không tìm thấy sách với ID: " + id));
    }

    // Nếu có ảnh mới
    if (req.file) {
      // Xoá ảnh cũ nếu có
      if (oldBook.BiaSach) {
        const oldPath = path.join(__dirname, "../", oldBook.BiaSach);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Gán đường dẫn ảnh mới
      updateData.BiaSach = `uploads/books/${req.file.filename}`;
    }

    const result = await bookService.update(id, updateData);

    if (!result) {
      return next(new ApiError(500, "Không thể cập nhật sách"));
    }

    // Trả về sách đã cập nhật
    const updatedBook = await bookService.findById(id);
    return res.send({ message: "Cập nhật thành công", document: updatedBook });
  } catch (err) {
    console.error("Lỗi khi cập nhật sách:", err);
    return next(new ApiError(500, "Lỗi khi cập nhật sách"));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy sách với ID: " + req.params.id)
      );
    }
    return res.send({ message: "Xoá thành công", document });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá sách với ID: " + req.params.id));
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const deletedCount = await bookService.deleteAll();
    return res.send({
      message: `${deletedCount} sách đã được xoá thành công`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá tất cả sách"));
  }
};
