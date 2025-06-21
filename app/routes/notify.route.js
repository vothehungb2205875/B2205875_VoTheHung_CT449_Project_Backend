const express = require("express");
const router = express.Router();
const notifyController = require("../controllers/notify.controller");
const isStaff = require("../middlewares/isStaff");

// Các route mở (ai cũng xem được)
router.get("/", notifyController.findAll);
router.get("/type/:loai", notifyController.findByLoai);
router.get("/latest", notifyController.findLatest);
router.get("/:id", notifyController.findOne);

// Các route cần quyền staff
router.post("/", isStaff, notifyController.create);
router.put("/:id", isStaff, notifyController.update);
router.delete("/:id", isStaff, notifyController.delete);
router.delete("/", isStaff, notifyController.deleteAll);

module.exports = router;
