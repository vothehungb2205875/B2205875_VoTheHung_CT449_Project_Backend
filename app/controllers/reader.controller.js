const MongoDB = require("../utils/mongodb.util");
const ReaderService = require("../services/reader.service");
const ApiError = require("../api-error");
const fs = require("fs");
const path = require("path");

exports.create = async (req, res, next) => {
  if (!req.body?.MaDocGia) {
    return next(new ApiError(400, "Mã độc giả không được rỗng"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm độc giả"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const readerService = new ReaderService(MongoDB.client);
    documents = await readerService.find({});
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách độc giả"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.findById(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy độc giả với ID: " + req.params.id)
      );
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy độc giả với ID: " + req.params.id)
    );
  }
};

exports.update = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const reader = await readerService.findById(req.params.id);

    if (!reader) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }

    // Xử lý avatar
    let avatarPath = reader.avatar; // giữ avatar cũ nếu không có file mới
    if (req.file) {
      avatarPath = `uploads/avatars/${req.file.filename}`;
      // Xoá ảnh cũ nếu không phải default
      if (reader.avatar && reader.avatar !== "uploads/avatars/default.jpg") {
        const oldPath = path.join(__dirname, "../", reader.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const updateData = {
      ...req.body,
      avatar: avatarPath,
    };

    const updated = await readerService.update(req.params.id, updateData);
    res.json(updated);
  } catch (err) {
    console.error("Lỗi khi cập nhật:", err);
    return next(new ApiError(500, "Lỗi khi cập nhật độc giả"));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.delete(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy độc giả với ID: " + req.params.id)
      );
    }
    return res.send({ message: "Xoá thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi xoá độc giả với ID: " + req.params.id)
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const deletedCount = await readerService.deleteAll();
    return res.send({
      message: `${deletedCount} độc giả đã được xoá thành công`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá tất cả độc giả"));
  }
};

exports.statistic = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const result = await readerService.getStatistics(); // gọi service mới thêm
    return res.send(result);
  } catch (error) {
    console.error("Lỗi thống kê độc giả:", error);
    return next(new ApiError(500, "Không thể thống kê độc giả"));
  }
};

exports.findByMa = async (req, res) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const reader = await readerService.findByMaDocGia(req.params.MaDocGia);
    if (!reader)
      return res.status(404).json({ message: "Không tìm thấy độc giả" });
    res.json(reader);
  } catch (err) {
    res.status(500).json({ message: "Lỗi truy vấn", error: err });
  }
};
