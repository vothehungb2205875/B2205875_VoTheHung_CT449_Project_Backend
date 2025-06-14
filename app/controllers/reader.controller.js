const MongoDB = require("../utils/mongodb.util");
const ReaderService = require("../services/reader.service");
const ApiError = require("../api-error");

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
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy độc giả với ID: " + req.params.id)
      );
    }
    return res.send({ message: "Cập nhật thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật độc giả với ID: " + req.params.id)
    );
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
