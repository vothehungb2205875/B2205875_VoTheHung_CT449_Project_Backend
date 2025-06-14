const app = require("./app"); // Import ứng dụng Express từ tệp app.js
const config = require("./app/config"); // Import Object config
const MongoDB = require("./app/utils/mongodb.util"); // Import MongoDB utility để kết nối với cơ sở dữ liệu

async function startServer() {
  try {
    // Kết nối đến cơ sở dữ liệu MongoDB
    const client = await MongoDB.connect(config.db.uri);
    app.locals.dbClient = client; // 👈 THÊM DÒNG NÀY

    console.log("Connected to the database!");

    // Lắng nghe cổng được chỉ định trong cấu hình
    app.listen(config.app.port, () => {
      console.log(`Server is running on port ${config.app.port}`);
    });
  } catch (error) {
    console.error("Cannot connect to the database!", error);
    process.exit(); // Dừng quá trình nếu không thể kết nối
  }
}

startServer(); // Gọi hàm để bắt đầu máy chủ
