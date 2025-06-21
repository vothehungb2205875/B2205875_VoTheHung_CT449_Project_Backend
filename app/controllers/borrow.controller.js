const MongoDB = require("../utils/mongodb.util");
const BorrowService = require("../services/borrow.service");
const ApiError = require("../api-error");
const BookService = require("../services/book.service");
const ReaderService = require("../services/reader.service");

exports.create = async (req, res, next) => {
  try {
    const { MaSach, NgayMuon, NgayTra } = req.body;

    if (!MaSach || !NgayMuon || !NgayTra) {
      return next(new ApiError(400, "Thiếu thông tin mượn sách"));
    }

    const MaDocGia = req.user.MaDocGia;
    const readerService = new ReaderService(MongoDB.client);
    const reader = await readerService.findByMaDocGia(MaDocGia);

    // Kiểm tra nếu không tìm thấy độc giả
    if (!reader) {
      return next(new ApiError(404, "Không tìm thấy thông tin độc giả"));
    }

    // Kiểm tra các trường bắt buộc
    const requiredFields = [
      "HoLot",
      "Ten",
      "DienThoai",
      "DiaChi",
      "NgaySinh",
      "Phai",
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = reader[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return next(
        new ApiError(
          400,
          "Vui lòng cập nhật thông tin độc giả trước khi mượn sách"
        )
      );
    }

    // Kiểm tra tồn tại sách
    const bookService = new BookService(MongoDB.client);
    const book = await bookService.findByMaSach(MaSach);

    if (!book) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }

    // Kiểm tra số lượng sách
    if (book.SoQuyen <= 0) {
      return next(new ApiError(400, "Sách đã hết, không thể mượn"));
    }

    // Giảm số lượng sách
    await bookService.update(book._id, {
      SoQuyen: book.SoQuyen - 1,
    });

    // Tạo bản ghi mượn
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.create({
      MaSach,
      MaDocGia,
      NgayMuon,
      NgayTra,
      TrangThai: "Đang mượn",
    });

    return res.status(201).json({ message: "Mượn sách thành công", result });
  } catch (err) {
    console.error("Lỗi khi mượn sách:", err);
    return next(new ApiError(500, "Lỗi mượn sách"));
  }
};

// Lấy tất cả lượt mượn
exports.findAll = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const documents = await borrowService.find();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Không thể lấy danh sách mượn sách"));
  }
};

// Lấy một lượt mượn theo ID
exports.findOne = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy lượt mượn"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Không thể truy xuất lượt mượn id=${req.params.id}`)
    );
  }
};

// Cập nhật lượt mượn (ví dụ ngày trả)
exports.update = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const bookService = new BookService(MongoDB.client);

    // Lấy bản ghi cũ để biết sách và trạng thái ban đầu
    const current = await borrowService.findById(req.params.id);
    if (!current) {
      return next(new ApiError(404, "Không tìm thấy lượt mượn để cập nhật"));
    }

    const newStatus = req.body.TrangThai;
    const wasBorrowed = current.TrangThai === "Đang mượn";
    const willReturn = newStatus === "Đã trả" || newStatus === "Đã hủy";

    // Nếu đang mượn và chuyển sang đã trả hoặc đã hủy -> tăng lại số lượng sách
    if (wasBorrowed && willReturn) {
      const book = await bookService.findByMaSach(current.MaSach);
      if (book) {
        await bookService.update(book._id, {
          SoQuyen: book.SoQuyen + 1,
        });
      }
    }

    // Cập nhật lượt mượn
    const document = await borrowService.update(req.params.id, req.body);

    return res.send({ message: "Cập nhật thành công", document });
  } catch (error) {
    console.error("Lỗi cập nhật lượt mượn:", error);
    return next(new ApiError(500, "Lỗi cập nhật lượt mượn"));
  }
};

// Xoá một lượt mượn
exports.delete = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const document = await borrowService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy lượt mượn để xoá"));
    }
    return res.send({ message: "Xoá thành công" });
  } catch (error) {
    return next(new ApiError(500, "Lỗi xoá lượt mượn"));
  }
};

// Xoá tất cả lượt mượn
exports.deleteAll = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const deletedCount = await borrowService.deleteAll();
    return res.send({ message: `${deletedCount} lượt mượn đã xoá thành công` });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá tất cả"));
  }
};

// Lấy theo độc giả
exports.findByReader = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.findByReaderWithBooks(
      req.params.maDocGia
    );
    return res.send(result);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tìm theo độc giả"));
  }
};

// Lấy theo sách
exports.findByBook = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const documents = await borrowService.findByBook(req.params.maSach);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tìm theo sách"));
  }
};

exports.statistic = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);

    const today = new Date();
    const month = parseInt(req.query.month) || today.getMonth() + 1;
    const year = parseInt(req.query.year) || today.getFullYear();

    const count = await borrowService.getStatistic(month, year);

    res.json({ month, year, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thống kê lượt mượn" });
  }
};
