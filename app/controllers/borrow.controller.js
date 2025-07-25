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

    // Kiểm tra nếu đã có 3 lượt mượn chưa trả
    const borrowService = new BorrowService(MongoDB.client);
    const borrowHistory = await borrowService.findByReaderWithBooks(MaDocGia);

    // Đếm số lượt có trạng thái "Đang mượn"
    const activeCount = borrowHistory.filter(
      (b) => b.TrangThai === "Đang mượn" || b.TrangThai === "Đăng ký mượn"
    ).length;

    if (activeCount >= 3) {
      return next(
        new ApiError(400, "Bạn đã có 3 sách đang mượn. Không thể mượn thêm.")
      );
    }

    if (activeCount.length >= 3) {
      return next(
        new ApiError(
          400,
          "Bạn đã có 3 lượt mượn/đăng ký chưa trả. Không thể mượn thêm."
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
    const result = await borrowService.create({
      MaSach,
      MaDocGia,
      NgayMuon,
      NgayTra,
      TrangThai: "Đăng ký mượn",
    });

    return res.status(201).json({ message: "Mượn sách thành công", result });
  } catch (err) {
    console.error("Lỗi khi mượn sách:", err);
    return next(new ApiError(500, "Lỗi mượn sách"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 5, startDate, endDate, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    const borrowService = new BorrowService(MongoDB.client);
    const readerService = new ReaderService(MongoDB.client);

    // Cập nhật trạng thái quá hạn trước khi lấy dữ liệu
    await borrowService.checkAndUpdateOverdueBorrows();

    // Xử lý tìm kiếm theo q
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      // Nếu là chuỗi số (giống số điện thoại)
      const isPhone = /^[0-9]{9,11}$/.test(q);
      if (isPhone) {
        // Tìm độc giả theo số điện thoại
        const readers = await readerService.collection
          .find({ DienThoai: regex })
          .toArray();

        if (readers.length > 0) {
          const maDocGiaList = readers.map((r) => r.MaDocGia);
          filter.MaDocGia = { $in: maDocGiaList };
        } else {
          return res.send({ data: [], total: 0 }); // Không tìm thấy độc giả
        }
      } else {
        // Tìm theo mã độc giả, mã sách, trạng thái
        filter.$or = [
          { MaDocGia: regex },
          { MaSach: regex },
          { TrangThai: regex },
        ];
      }
    }

    // Lọc theo khoảng thời gian mượn
    if (startDate && endDate) {
      filter.NgayMuon = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Lọc theo trạng thái
    if (status) {
      filter.TrangThai = status;
    }

    const total = await borrowService.count(filter);
    const data = await borrowService.find(filter, skip, parseInt(limit));

    res.send({ data, total });
  } catch (err) {
    console.error("Lỗi tìm mượn sách:", err);
    next(new ApiError(500, "Lỗi tìm mượn sách"));
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

// Cập nhật lượt mượn
exports.update = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const bookService = new BookService(MongoDB.client);

    const current = await borrowService.findById(req.params.id);
    if (!current) {
      return next(new ApiError(404, "Không tìm thấy lượt mượn để cập nhật"));
    }

    const oldStatus = current.TrangThai;
    const newStatus = req.body.TrangThai;

    // Chỉ tăng lại số lượng sách trong 4 trường hợp hợp lệ
    const shouldIncreaseQuantity =
      (["Đăng ký mượn", "Quá hạn nhận"].includes(oldStatus) &&
        newStatus === "Đã hủy") ||
      (["Đang mượn", "Quá hạn trả"].includes(oldStatus) &&
        newStatus === "Đã trả");

    if (shouldIncreaseQuantity) {
      const book = await bookService.findByMaSach(current.MaSach);
      if (book) {
        await bookService.update(book._id, {
          SoQuyen: book.SoQuyen + 1,
        });
      }
    }

    // Ghi ngày trả thực tế nếu là "Đã trả"
    if (newStatus === "Đã trả") {
      req.body.NgayTraTT = new Date();
    }

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

// Thống kê
exports.statistic = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);

    const today = new Date();
    const month = parseInt(req.query.month) || today.getMonth() + 1;
    const year = parseInt(req.query.year) || today.getFullYear();

    const { soLuotMuon, soLuotQuaHan } = await borrowService.getStatistic(
      month,
      year
    );

    res.json({ month, year, soLuotMuon, soLuotQuaHan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thống kê lượt mượn" });
  }
};
