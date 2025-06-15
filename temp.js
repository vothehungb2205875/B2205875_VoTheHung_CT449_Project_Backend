const bcrypt = require("bcryptjs");

async function run() {
  const plainPassword = "nhanvienctlib"; // mật khẩu khởi tạo
  const hashed = await bcrypt.hash(plainPassword, 10);
  console.log("Hashed admin password:", hashed);
}

run();
