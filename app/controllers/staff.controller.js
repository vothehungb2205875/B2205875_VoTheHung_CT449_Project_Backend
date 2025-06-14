const MongoDB = require("../utils/mongodb.util");
const StaffService = require("../services/staff.service");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.MSNV) {
    return next(new ApiError(400, "Mã nhân viên không được rỗng"));
  }

  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm nhân viên"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const staffService = new StaffService(MongoDB.client);
    documents = await staffService.find({});
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách nhân viên"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.findById(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy nhân viên với ID: " + req.params.id)
      );
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy nhân viên với ID: " + req.params.id)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy nhân viên với ID: " + req.params.id)
      );
    }
    return res.send({ message: "Cập nhật thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật nhân viên với ID: " + req.params.id)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.delete(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy nhân viên với ID: " + req.params.id)
      );
    }
    return res.send({ message: "Xoá thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi xoá nhân viên với ID: " + req.params.id)
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const deletedCount = await staffService.deleteAll();
    return res.send({
      message: `${deletedCount} nhân viên đã được xoá thành công`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá tất cả nhân viên"));
  }
};
