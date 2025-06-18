app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Lỗi không xác định
  console.error("Lỗi hệ thống:", err);
  res.status(500).json({ message: "Đã xảy ra lỗi hệ thống" });
});
