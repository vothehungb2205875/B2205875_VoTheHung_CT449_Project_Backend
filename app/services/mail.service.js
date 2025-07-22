const nodemailer = require("nodemailer");
require("dotenv").config();

class MailService {
  // Khởi tạo transporter với thông tin đăng nhập email
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  // Phương thức gửi email
  async sendMail({ to, subject, text, html }) {
    return await this.transporter.sendMail({
      from: `"Thư viện CTLIB 📚" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
  }
}

module.exports = new MailService();
