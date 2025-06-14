const config = {
  // Object config
  app: {
    port: process.env.PORT || 3000, // Có thể dùng .env để cấu hình
  },
  db: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/library", // Có thể dùng .env để cấu hình
  },
};

module.exports = config; // Export Object config để sử dụng trong các tệp khác
