const express = require("express");
const borrow = require("../controllers/borrow.controller");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.post("/", verifyToken, borrow.create);
router.get("/", borrow.findAll);
router.get("/statistic", borrow.statistic);
router.get("/:id", borrow.findOne);
router.put("/:id", borrow.update);
router.delete("/:id", borrow.delete);
router.delete("/", borrow.deleteAll);
router.get("/history/:maDocGia", borrow.findByReader);
router.get("/book/:maSach", borrow.findByBook);

module.exports = router;
