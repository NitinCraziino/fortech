const express = require("express");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddelWare");
const {
  createProduct,
  updateProductStatus,
  editProduct,
  getAllProducts,
  getProductById,
  getCustomerProducts,
  getCustomerPrices,
  updateCustomerPrice,
  bulkUpdatePrice,
  importCustomerProducts,
  assignProductsToCustomers,
  toggleProductTaxStatus,
  toggleCustomerProductFavoriteStatus,
  bulkToggleCustomerProductFavoriteStatus
} = require("../controllers/productController");
const upload = require("../helpers/multerConfig");
const router = express.Router();

router.post("/create", jwtAuthMiddleware, upload.single("image"), createProduct);
router.post("/updateStatus", jwtAuthMiddleware, updateProductStatus);
router.post("/edit", jwtAuthMiddleware, upload.single("image"), editProduct);
router.get("/get", jwtAuthMiddleware, getAllProducts);
router.get("/get/:id", jwtAuthMiddleware, getProductById);
router.get("/getCustomerProducts", jwtAuthMiddleware, getCustomerProducts);
router.post("/getCustomerPrices", jwtAuthMiddleware, getCustomerPrices);
router.post("/updateCustomerPrice", jwtAuthMiddleware, updateCustomerPrice);
router.post("/bulkUpdatePrice", jwtAuthMiddleware, upload.single("prices"), bulkUpdatePrice);
router.post("/importCustomerProducts", jwtAuthMiddleware, upload.single("products"), importCustomerProducts)
router.post("/assignToCustomers", jwtAuthMiddleware, assignProductsToCustomers);
router.put("/toggleTaxSetting", jwtAuthMiddleware, toggleProductTaxStatus);
router.put("/toggleCustomerProductFavorite", jwtAuthMiddleware, toggleCustomerProductFavoriteStatus);
router.put("/toggleBulkCustomerProductFavorite", jwtAuthMiddleware, bulkToggleCustomerProductFavoriteStatus);

module.exports = router;
