const MailService = require("../services/mail.service");

exports.sendReminder = async (req, res) => {
  const { to, readerName, bookCode, dueDate } = req.body;

  try {
    const result = await MailService.sendMail({
      to,
      subject: `📚 Nhắc trả sách: ${bookCode}`,
      html: `
        <p>Xin chào <b>${readerName}</b>,</p>
        <p>Bạn đang quá hạn trả sách <strong>${bookCode}</strong> (hạn: <b>${dueDate}</b>).</p>
        <p>Vui lòng đến thư viện để trả sách.</p>
        <p>-- Thư viện</p>
      `,
    });

    res.json({ message: "Đã gửi email nhắc trả", info: result });
  } catch (err) {
    res.status(500).json({ message: "Không thể gửi email", error: err });
  }
};
