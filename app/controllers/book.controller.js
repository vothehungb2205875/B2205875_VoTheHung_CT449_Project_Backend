const MongoDB = require("../utils/mongodb.util");
const BookService = require("../services/book.service");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.MaSach) {
    // Kiểm tra xem MaSach có được cung cấp hay không nếu không trả về undefined
    return next(new ApiError(400, "Mã sách không được rỗng"));
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm sách"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const bookService = new BookService(MongoDB.client);
    documents = await bookService.find({});
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách sách"));
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
  if (Object.keys(req.body).length === 0) {
    // Kiểm tra xem có dữ liệu nào trong body không
    return next(new ApiError(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy sách với ID: " + req.params.id)
      );
    }
    return res.send({ message: "Cập nhật thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật sách với ID: " + req.params.id)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy sách với ID: " + req.params.id)
      );
    }
    return res.send({ message: "Xoá thành công", document });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xoá sách với ID: " + req.params.id));
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
