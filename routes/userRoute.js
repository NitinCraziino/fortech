const express = require("express");
const { inviteCustomer, createAdmin, getCustomers, deleteCustomerProduct, toggleTaxSetting, getCustomer } = require("../controllers/userController");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddelWare");
const upload = require("../helpers/multerConfig");
const router = express.Router();

router.post("/inviteCustomer",jwtAuthMiddleware, upload.single("products"), inviteCustomer);
router.post("/createAdmin", createAdmin);
router.get("/getCustomers", jwtAuthMiddleware, getCustomers);
router.get("/getCustomer/:id", jwtAuthMiddleware, getCustomer);
router.post("/deleteCustomerProduct", jwtAuthMiddleware, deleteCustomerProduct)
router.post("/toggleTaxSetting", jwtAuthMiddleware, toggleTaxSetting)
module.exports = router;