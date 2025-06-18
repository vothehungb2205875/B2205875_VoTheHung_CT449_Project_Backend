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
    const reader = await readerService.find({ MaDocGia });
    if (
      !reader.HoLot ||
      !reader.Ten ||
      !reader.DienThoai ||
      !reader.DiaChi ||
      !reader.NgaySinh ||
      !reader.Phai
    ) {
      return next(
        new ApiError(
          400,
          "Vui lòng cập nhật thông tin độc giả trước khi mượn sách"
        )
      );
    }

    const payload = {
      MaSach,
      MaDocGia,
      NgayMuon,
      NgayTra,
      TrangThai: "Đang mượn",
    };

    const bookService = new BookService(MongoDB.client);
    const book = await bookService.findByMaSach(MaSach);

    if (!book) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }

    if (book.SoQuyen <= 0) {
      return next(new ApiError(400, "Sách đã hết, không thể mượn"));
    }

    await bookService.update(book._id, {
      SoQuyen: book.SoQuyen - 1,
    });

    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.create(payload);

    return res.status(201).json({ message: "Mượn sách thành công", result });
  } catch (err) {
    console.error("Lỗi khi mượn sách:", err); // Thêm log cụ thể
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
    const document = await borrowService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy lượt mượn để cập nhật"));
    }
    return res.send({ message: "Cập nhật thành công", document });
  } catch (error) {
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
