const fs = require("fs");
const path = require("path");
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;
const FULL_API_URL = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
const quytrinhPath = path.join(__dirname, "../uploads/chatbot/quytrinh.txt");

exports.ask = async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Thiếu nội dung câu hỏi." });
  }

  try {
    const quytrinhText = fs.readFileSync(quytrinhPath, "utf-8");
    const base64 = Buffer.from(quytrinhText, "utf-8").toString("base64");

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Bạn là một chatbot hỗ trợ nghiệp vụ thư viện.
                Nếu câu hỏi người dùng liên quan đến quy trình nghiệp vụ, hãy trả lời theo quy trình đã được cung cấp trong file quy trình.
                Nếu người dùng không hỏi về quy trình, hãy trả lời bình thường.
                Khi trả lời đừng nhắc về việc bạn được cung cấp quy trình, chỉ cần trả lời câu hỏi của người dùng.`,
            },
          ],
        },
        {
          role: "user",
          parts: [
            { text: question },
            {
              inline_data: {
                data: base64,
                mime_type: "text/plain",
              },
            },
          ],
        },
      ],
    };

    const geminiRes = await axios.post(FULL_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const reply =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Không có phản hồi";

    res.json({ reply });
  } catch (err) {
    console.error("Lỗi Gemini:", err.message);
    res.status(500).json({ error: "Đã xảy ra lỗi máy chủ." });
  }
};
