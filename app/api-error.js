class ApiError extends Error {
  constructor(statusCode, message) {
    super(message); // Gọi constructor của Error với message
    this.statusCode = statusCode;
    this.name = "ApiError"; // Giúp phân biệt loại lỗi khi log
    Error.captureStackTrace(this, this.constructor); // Stack trace rõ ràng hơn
  }
}

module.exports = ApiError;
