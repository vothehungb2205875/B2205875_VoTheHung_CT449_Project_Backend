const express = require("express");
const borrow = require("../controllers/borrow.controller");
const verifyToken = require("../middlewares/verifyToken");
const { handleValidationErrors } = require("../middlewares/validate");
const borrowValidator = require("../validators/borrow.validator");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  borrowValidator,
  handleValidationErrors,
  borrow.create
);
router.get("/", borrow.findAll);
router.get("/statistic", borrow.statistic);
router.get("/:id", borrow.findOne);
router.put("/:id", verifyToken, borrow.update);
router.delete("/:id", verifyToken, borrow.delete);
router.delete("/", verifyToken, borrow.deleteAll);
router.get("/history/:maDocGia", borrow.findByReader);
router.get("/book/:maSach", borrow.findByBook);

module.exports = router;
