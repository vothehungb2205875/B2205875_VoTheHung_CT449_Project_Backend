const multer = require("multer");
const path = require("path");
const fs = require("fs");

const bookCoverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/books");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const uploadBookCover = multer({
  storage: bookCoverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // giới hạn 5MB
});

module.exports = uploadBookCover;
