const MongoDB = require("../utils/mongodb.util");
const BookService = require("../services/book.service");
const ApiError = require("../api-error");
const fs = require("fs");
const path = require("path");

const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4);

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseDiacritics(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

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

  // Tạo MaSach nếu chưa có
  if (!data.MaSach && data.TenSach) {
    const cleanTitle = removeVietnameseDiacritics(data.TenSach);
    const prefix = cleanTitle
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word[0].toUpperCase())
      .slice(0, 3)
      .join("");

    const now = new Date();
    const dateCode = `${now.getFullYear().toString().slice(-2)}${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
    const randomCode = nanoid();

    data.MaSach = `${prefix}-${dateCode}-${randomCode}`;
  }

  // Gán đường dẫn ảnh nếu có file
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
    const { q, genre, nxb, year, TrangThai, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let filter = {};

    // Lọc theo trạng thái
    if (TrangThai === "Đã xóa") {
      filter.TrangThai = "Đã xóa";
    } else {
      filter.TrangThai = { $ne: "Đã xóa" };
    }

    // Lọc theo tên, mã
    if (q) {
      const regex = { $regex: escapeRegex(q), $options: "i" };
      filter.$or = [{ TenSach: regex }, { MaSach: regex }];
    }

    // Lọc theo thể loại
    if (genre) {
      filter.TheLoai = genre;
    }

    // Lọc theo Nhà xuất bản
    if (nxb) {
      filter.MaNXB = nxb;
    }

    // Lọc theo Năm xuất bản
    if (year) {
      filter.NamXuatBan = parseInt(year);
    }

    const bookService = new BookService(MongoDB.client);
    const total = await bookService.count(filter);
    const data = await bookService.find(filter, skip, parseInt(limit));

    res.send({ data, total });
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

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    const bookService = new BookService(MongoDB.client);
    const oldBook = await bookService.findById(id);

    if (!oldBook) {
      return next(new ApiError(404, `Không tìm thấy sách với ID: ${id}`));
    }

    // Danh sách các trường được phép cập nhật
    const allowedFields = [
      "TenSach",
      "TacGia",
      "TheLoai",
      "MaNXB",
      "DonGia",
      "SoQuyen",
      "NamXuatBan",
      "TrangThai",
    ];
    updateData = allowedFields.reduce((obj, key) => {
      if (updateData[key] !== undefined) obj[key] = updateData[key];
      return obj;
    }, {});

    // Nếu có ảnh mới
    if (req.file) {
      if (oldBook.BiaSach) {
        const oldPath = path.resolve(__dirname, "../", oldBook.BiaSach);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      updateData.BiaSach = `uploads/books/${req.file.filename}`;
    }

    const result = await bookService.update(id, updateData);
    if (!result) {
      return next(new ApiError(500, "Không thể cập nhật sách"));
    }

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
    const document = await bookService.findById(req.params.id);

    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy sách với ID: " + req.params.id)
      );
    }

    // Cập nhật trạng thái sách thành "Đã xóa"
    await bookService.update(req.params.id, { TrangThai: "Đã xóa" });

    return res.send({ message: "Đã đánh dấu là 'Đã xóa'", document });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái sách"));
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

exports.getFilters = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);

    // Lấy tất cả sách (chỉ cần các trường liên quan)
    const books = await bookService.find({}, 0, 10000); // hoặc dùng projection nếu bạn tối ưu sau

    // Lọc ra danh sách duy nhất
    const genres = [
      ...new Set(books.map((book) => book.TheLoai).filter(Boolean)),
    ];
    const nxbs = [...new Set(books.map((book) => book.MaNXB).filter(Boolean))];

    res.send({ genres, nxbs });
  } catch (err) {
    console.error("Lỗi khi lấy bộ lọc:", err);
    return next(new ApiError(500, "Không thể lấy dữ liệu bộ lọc"));
  }
};
