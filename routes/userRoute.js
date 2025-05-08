const express = require("express");
const {inviteCustomer, createAdmin, getCustomers, deleteCustomerProduct, getCustomer, updateCustomerNameAndEmail} = require("../controllers/userController");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddelWare");
const upload = require("../helpers/multerConfig");
const {toggleCustomerProductTaxStatus} = require("../controllers/productController");
const router = express.Router();

router.post("/inviteCustomer", jwtAuthMiddleware, upload.single("products"), inviteCustomer);
router.post("/createAdmin", createAdmin);
router.get("/getCustomers", jwtAuthMiddleware, getCustomers);
router.get("/getCustomer/:id", jwtAuthMiddleware, getCustomer);
router.post("/deleteCustomerProduct", jwtAuthMiddleware, deleteCustomerProduct)
router.put("/toggleTaxSetting", jwtAuthMiddleware, toggleCustomerProductTaxStatus);
router.patch("/updateNameAndEmail/:id", jwtAuthMiddleware, updateCustomerNameAndEmail)

module.exports = router;