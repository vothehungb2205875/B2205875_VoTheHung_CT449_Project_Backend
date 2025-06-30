const MongoDB = require("../utils/mongodb.util");
const StaffService = require("../services/staff.service");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);

    // Tạo mã nhân viên: NV + 3 số ngẫu nhiên, đảm bảo không trùng
    let randomCode;
    let existing;
    do {
      randomCode = "NV" + Math.floor(100 + Math.random() * 900); // VD: NV123
      existing = await staffService.find({ MSNV: randomCode });
    } while (existing.length > 0);

    const staffData = {
      ...req.body,
      MSNV: randomCode,
      TrangThai: req.body.TrangThai || "Hoạt động", // Mặc định trạng thái
    };

    const document = await staffService.create(staffData);
    res.send(document);
  } catch (err) {
    next(new ApiError(500, "Lỗi khi tạo nhân viên"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 5, TrangThai } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const regex = q ? new RegExp(q, "i") : null;

    const filter = {};
    if (q) {
      filter.$or = [
        { MSNV: regex },
        { HoTenNV: regex },
        { ChucVu: regex },
        { email: regex },
      ];
    }
    if (TrangThai) {
      filter.TrangThai = TrangThai;
    } else {
      filter.TrangThai = { $ne: "Vô hiệu hóa" };
    }

    const staffService = new StaffService(MongoDB.client);
    const total = await staffService.count(filter);
    const data = await staffService.find(filter, skip, parseInt(limit));
    res.send({ data, total });
  } catch (err) {
    next(new ApiError(500, "Lỗi khi tìm danh sách nhân viên"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const staff = await staffService.findById(req.params.id);
    if (!staff) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    res.send(staff);
  } catch (err) {
    next(new ApiError(500, "Lỗi khi tìm nhân viên"));
  }
};

exports.update = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const updated = await staffService.update(req.params.id, req.body);
    res.send(updated);
  } catch (err) {
    next(new ApiError(500, "Lỗi khi cập nhật nhân viên"));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const result = await staffService.delete(req.params.id);
    res.send({ message: "Đã xóa thành công", result });
  } catch (err) {
    next(new ApiError(500, "Lỗi khi xóa nhân viên"));
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const count = await staffService.deleteAll();
    res.send({ message: `${count} nhân viên đã bị xóa` });
  } catch (err) {
    next(new ApiError(500, "Lỗi khi xóa tất cả nhân viên"));
  }
};
