const express = require("express");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddelWare");
const {createOrder, getOrderHistory, getAllOrders, getOrderById, exportOrders, fulfillOrders, deleteOrder} = require("../controllers/orderController");
const router = express.Router();

router.post("/create", jwtAuthMiddleware, createOrder);
router.get("/get/:userId", jwtAuthMiddleware, getOrderHistory);
router.get("/get", jwtAuthMiddleware, getAllOrders);
router.get("/getOrder/:id", jwtAuthMiddleware, getOrderById);
router.post("/exportOrders", jwtAuthMiddleware, exportOrders);
router.put("/fulfill", jwtAuthMiddleware, fulfillOrders)
router.delete("/:orderId", jwtAuthMiddleware, deleteOrder)

module.exports = router;