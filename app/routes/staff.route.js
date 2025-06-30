const express = require("express");
const staffs = require("../controllers/staff.controller.js");
const verifyStaff = require("../middlewares/isStaff");
const requireManager = require("../middlewares/requireManager");
const {
  validateCreateStaff,
  validateUpdateStaff,
} = require("../validators/staff.validator");
const { handleValidationErrors } = require("../middlewares/validate");

const router = express.Router();

router.use(verifyStaff);

router.get("/", staffs.findAll);
router.get("/:id", staffs.findOne);

router.post(
  "/",
  requireManager,
  validateCreateStaff,
  handleValidationErrors,
  staffs.create
);

router.put(
  "/:id",
  requireManager,
  validateUpdateStaff,
  handleValidationErrors,
  staffs.update
);

router.delete("/:id", requireManager, staffs.delete);
router.delete("/", requireManager, staffs.deleteAll);

module.exports = router;
