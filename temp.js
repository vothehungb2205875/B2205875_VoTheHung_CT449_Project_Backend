require("dotenv").config();
const MailService = require("./app/services/mail.service");

(async () => {
  try {
    const info = await MailService.sendMail({
      to: "hungb2205875@student.ctu.edu.vn", // Thay email này bằng email của bạn để test
      subject: "Test Email từ Nodemailer",
      html: "<p>Đây là email thử nghiệm từ Nodemailer</p>",
    });
    console.log("✅ Email đã gửi: ", info.messageId);
  } catch (err) {
    console.error("❌ Gửi mail thất bại:", err.message || err);
  }
})();
