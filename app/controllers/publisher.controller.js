const MongoDB = require("../utils/mongodb.util");
const PublisherService = require("../services/publisher.service");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.MaNXB) {
    return next(new ApiError(400, "Mã nhà xuất bản không được rỗng"));
  }

  try {
    const publisherService = new PublisherService(MongoDB.client);

    const existed = await publisherService.findByMaNXB(req.body.MaNXB);
    if (existed) {
      return next(new ApiError(400, "Mã nhà xuất bản đã tồn tại"));
    }

    const document = await publisherService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm nhà xuất bản"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const { q, page = 1, limit = 5 } = req.query;

    const condition = q ? { TenNXB: { $regex: new RegExp(q, "i") } } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await publisherService.count(condition);
    const data = await publisherService.findWithPagination(
      condition,
      skip,
      parseInt(limit)
    );

    return res.send({ data, total });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách nhà xuất bản"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.findById(req.params.id);
    if (!document) {
      return next(
        new ApiError(
          404,
          "Không tìm thấy nhà xuất bản với ID: " + req.params.id
        )
      );
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy nhà xuất bản với ID: " + req.params.id)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(
          404,
          "Không tìm thấy nhà xuất bản với ID: " + req.params.id
        )
      );
    }
    return res.send({ message: "Cập nhật thành công", document });
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Lỗi khi cập nhật nhà xuất bản với ID: " + req.params.id
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.delete(req.params.id);
    if (!document) {
      return next(
        new ApiError(
          404,
          "Không tìm thấy nhà xuất bản với ID: " + req.params.id
        )
      );
    }
    return res.send({ message: "Xoá thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi xoá nhà xuất bản với ID: " + req.params.id)
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const deletedCount = await publisherService.deleteAll();
    return res.send({
      message: `${deletedCount} nhà xuất bản đã được xoá thành công`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá tất cả nhà xuất bản"));
  }
};
