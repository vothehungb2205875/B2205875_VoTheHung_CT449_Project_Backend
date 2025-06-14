const express = require("express");
const staffs = require("../controllers/staff.controller.js");

const router = express.Router();

// Route: Thêm nhân viên mới
router.post("/", staffs.create);

// Route: Lấy tất cả nhân viên
router.get("/", staffs.findAll);

// Route: Lấy 1 nhân viên theo ID
router.get("/:id", staffs.findOne);

// Route: Cập nhật nhân viên theo ID
router.put("/:id", staffs.update);

// Route: Xoá nhân viên theo ID
router.delete("/:id", staffs.delete);

// Route: Xoá tất cả nhân viên
router.delete("/", staffs.deleteAll);

// Xuất router để dùng trong app chính
module.exports = router;
