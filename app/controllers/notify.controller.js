const NotifyService = require("../services/notify.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// [POST] /api/notifications
exports.create = async (req, res, next) => {
  try {
    const service = new NotifyService(MongoDB.client);
    const document = await service.create(req.body);
    return res.status(201).send(document);
  } catch (error) {
    return next(new ApiError(500, "Không thể tạo thông báo"));
  }
};

// [GET] /api/notifications
exports.findAll = async (req, res, next) => {
  try {
    const service = new NotifyService(MongoDB.client);
    const documents = await service.find({});
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Không thể truy xuất thông báo"));
  }
};

// [GET] /api/notifications/type/:loai
exports.findByLoai = async (req, res, next) => {
  try {
    const service = new NotifyService(MongoDB.client);
    const documents = await service.findByLoai(req.params.loai);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Không thể truy xuất theo loại"));
  }
};

// [GET] /api/notifications/latest
exports.findLatest = async (req, res, next) => {
  try {
    const service = new NotifyService(MongoDB.client);
    const documents = await service.findLatest();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Không thể truy xuất thông báo mới nhất"));
  }
};

// [GET] /api/notifications/:id
exports.findOne = async (req, res, next) => {
  try {
    const service = new NotifyService(MongoDB.client);
    const document = await service.findById(req.params.id);
    if (!document) return next(new ApiError(404, "Không tìm thấy thông báo"));
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi truy xuất thông báo"));
  }
};

// [PUT] /api/notifications/:id
exports.update = async (req, res, next) => {
  try {
    const service = new NotifyService(MongoDB.client);
    const document = await service.update(req.params.id, req.body);
    if (!document)
      return next(new ApiError(404, "Không tìm thấy thông báo để cập nhật"));
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Không thể cập nhật thông báo"));
  }
};

// [DELETE] /api/notifications/:id
exports.delete = async (req, res, next) => {
  try {
    const service = new NotifyService(MongoDB.client);
    const document = await service.delete(req.params.id);
    if (!document)
      return next(new ApiError(404, "Không tìm thấy thông báo để xóa"));
    return res.send({ message: "Thông báo đã được xóa" });
  } catch (error) {
    return next(new ApiError(500, "Không thể xóa thông báo"));
  }
};

// [DELETE] /api/notifications
exports.deleteAll = async (req, res, next) => {
  try {
    const service = new NotifyService(MongoDB.client);
    const deletedCount = await service.deleteAll();
    return res.send({ message: `${deletedCount} thông báo đã bị xóa` });
  } catch (error) {
    return next(new ApiError(500, "Không thể xóa tất cả thông báo"));
  }
};
