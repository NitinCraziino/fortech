const Order = require("../schema/orderSchema");
const Product = require("../schema/productSchema");
const User = require("../schema/userSchema");
const EmailTemplate = require("../schema/emailtemplateSchema");
const {sendEmail} = require("./emailController");
const {createObjectCsvWriter} = require("csv-writer");

const createOrder = async (req, res) => {
  try {
    const {products, userId, pickupLocation, poNumber, comments, deliveryDate, taxApplied} = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({error: "User not found."});
    }

    let subtotal = 0;
    let productDetails = [];

    productDetails = await Promise.all(
      products.map(async (product) => {
        const {productId, quantity, price} = product;
        const productData = await Product.findById(product.productId);
        if (productData && productData.active) {
          subtotal += price * quantity;
          return {productId, quantity, price};
        } else {
          return false;
        }
      })
    );

    // Filter out invalid products
    productDetails = productDetails.filter((x) => x);

    // Apply tax if needed
    const TAX_RATE = 0.06; // 6% tax rate
    const taxAmount = taxApplied ? parseFloat((subtotal * TAX_RATE).toFixed(2)) : 0;
    const totalPrice = parseFloat((subtotal + taxAmount).toFixed(2));

    const newOrder = new Order({
      userId,
      products: productDetails,
      subtotal,
      taxAmount,
      taxApplied,
      totalPrice,
      pickupLocation,
      poNumber,
      comments,
      deliveryDate,
    });

    const savedOrder = await newOrder.save();
    const emailTemplate = await EmailTemplate.findOne({type: "ORDER CONFIRMATION"}).lean().exec();

    sendEmail({
      to: user.email,
      from: "brian@naisupply.com",
      subject: emailTemplate.subject,
      html: emailTemplate.body
        .replace("[username]", user.name)
        .replace("[order id]", savedOrder.orderNo)
        .replace("[amount]", savedOrder.totalPrice)
        .replace("[order date & time]", savedOrder.createdAt)
        .replace("[vieworderlink]", `https://www.naisorders.com/view-order/${savedOrder._id}`),
    });

    const template = await EmailTemplate.findOne({type: "NEW ORDER"}).lean().exec();

    const admin = await User.findOne({admin: true}).lean().exec();

    sendEmail({
      to: admin.email,
      from: "brian@naisupply.com",
      subject: template.subject,
      html: template.body
        .replace("[username]", admin.name)
        .replace("[customer name]", user.name)
        .replace("[order id]", savedOrder.orderNo)
        .replace("[amount]", savedOrder.totalPrice)
        .replace("[order date & time]", savedOrder.createdAt)
        .replace("[vieworderlink]", `https://www.naisorders.com/view-order/${savedOrder._id}`),
    });

    res.status(200).json({order: savedOrder});
  } catch (error) {
    console.log("🚀 ~ createOrder ~ error:", error);
    res.status(500).json({error: error.message || "Error creating order."});
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({userId: req.params.userId})
      .sort({createdAt: -1})
      .populate({
        path: "products.productId", // Populate product details (Product schema)
        select: "partNo description image name", // Select specific fields to return from Product
      })
      .lean()
      .exec();
    res.status(200).json({orders});
  } catch (error) {
    res.status(500).json({error: error.message || "Error getting order history."});
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({createdAt: -1})
      .populate({
        path: "products.productId", // Populate product details (Product schema)
        select: "partNo description image name", // Select specific fields to return from Product
      })
      .populate({
        path: "userId", // Populate user details (User schema)
        select: "name email", // Select specific fields to return from User
      })
      .lean()
      .exec();
    res.status(200).json({orders});
  } catch (error) {
    res.status(500).json({error: error.message || "Error getting order history."});
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({_id: req.params.id})
      .populate({
        path: "products.productId", // Populate product details (Product schema)
        select: "partNo description image name", // Select specific fields to return from Product
      })
      .populate({
        path: "userId", // Populate user details (User schema)
        select: "name email", // Select specific fields to return from User
      })
      .lean()
      .exec();
    res.status(200).json({order});
  } catch (error) {
    res.status(500).json({error: error.message || "Error getting order."});
  }
};

const exportOrders = async (req, res) => {
  try {
    if (req.user.admin) {
      const orders = await Order.find({
        _id: {$in: req.body.orderIds}, // Match documents with these _id values
      }).sort({createdAt: -1})
        .populate({
          path: "products.productId", // Populate product details (Product schema)
          select: "partNo description image name", // Select specific fields to return from Product
        })
        .populate({
          path: "userId", // Populate user details (User schema)
          select: "name email", // Select specific fields to return from User
        })
        .lean()
        .exec();
      const records = orders.flatMap((order) =>
        order.products.map((product) => ({
          OrderNumber: order.orderNo,
          UserEmail: order.userId.email || "N/A",
          UserName: order.userId.name || "N/A",
          PickupLocation: order.pickupLocation,
          DeliveryDate: order.deliveryDate || "N/A",
          TotalPrice: order.totalPrice.toFixed(2),
          Comments: order.comments || "N/A",
          PoNumber: order.poNumber,
          ProductName: product.productId.name || "N/A",
          PartNumber: product.productId.partNo || "N/A",
          ProductQuantity: product.quantity,
          ProductPrice: product.price.toFixed(2),
          OrderCreatedAt: order.createdAt.toISOString(),
        }))
      );
      const fileName = `orders_${Date.now()}.csv`;
      const csvWriter = createObjectCsvWriter({
        path: `./uploads/${fileName}`,
        header: [
          {id: "OrderNumber", title: "Order Number"},
          {id: "PickupLocation", title: "Pickup Location"},
          {id: "DeliveryDate", title: "Delivery Date"},
          {id: "UserEmail", title: "User Email"},
          {id: "UserName", title: "User Name"},
          {id: "PoNumber", title: "PO Number"},
          {id: "TotalPrice", title: "Total Price"},
          {id: "ProductName", title: "Product Name"},
          {id: "PartNumber", title: "Part Name"},
          {id: "ProductQuantity", title: "Product Quantity"},
          {id: "ProductPrice", title: "Product Price"},
          {id: "Comments", title: "Comments"},
          {id: "OrderCreatedAt", title: "Order Created At"},
        ],
      });

      await csvWriter.writeRecords(records);
      res.status(200).json({fileUrl: `https://www.naisorders.com/uploads/${fileName}`});
    } else {
      res.status(400).json({error: "Invalid permission."});
    }
  } catch (error) {
    console.log("🚀 ~ exportOrders ~ error:", error);
    res.status(500).json("error");
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderById,
  getAllOrders,
  exportOrders,
};
