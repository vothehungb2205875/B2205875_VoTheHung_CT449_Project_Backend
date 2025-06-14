const { MongoClient } = require("mongodb"); // Import MongoClient từ thư viện mongodb thay vì lấy tất cả thư viện

class MongoDB {
  static connect = async (uri) => {
    // Static dùng để gọi hàm mà không cần tạo instance
    if (this.client) return this.client;
    this.client = await MongoClient.connect(uri);
    return this.client;
  };
}

module.exports = MongoDB;
