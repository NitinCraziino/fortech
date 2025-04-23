const Order = require("../schema/orderSchema");
const CustomerProduct = require("../schema/customerProductSchema")
const User = require("../schema/userSchema");
const EmailTemplate = require("../schema/emailtemplateSchema");
const {sendEmail} = require("./emailController");
const {createObjectCsvWriter} = require("csv-writer");

const TAX_RATE = 0.06; // 6% tax rate

const createOrder = async (req, res) => {
  try {
    const {products, userId, pickupLocation, poNumber, comments, deliveryDate} = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({error: "User not found."});
    }

    const customerProducts = await CustomerProduct.findOne({customerId: userId});
    if (!customerProducts) {
      return res.status(400).json({error: "Customer products not found."});
    }

    let subtotal = 0;
    let totalTaxAmount = 0;
    let processedProducts = [];

    for (const product of products) {
      const {productId, quantity} = product;

      const customerProduct = customerProducts.products.find(
        p => p.productId.toString() === productId
      );

      if (!customerProduct) {
        return res.status(400).json({
          error: `Product with ID ${productId} not found in customer's product list.`
        });
      }

      // Use server-verified price from the database
      const verifiedPrice = customerProduct.price;
      const taxEnabled = customerProduct.taxEnabled;

      // Calculate amounts on server side
      const productAmount = verifiedPrice * quantity;
      const productTaxAmount = taxEnabled ? Number((productAmount * TAX_RATE).toFixed(2)) : 0;

      subtotal += productAmount;
      totalTaxAmount += productTaxAmount;

      // Add product to processed list
      processedProducts.push({
        productId,
        quantity,
        price: verifiedPrice,
        taxEnabled: taxEnabled,
        amount: productAmount,
        taxAmount: productTaxAmount
      });
    }

    // Calculate final total
    const totalPrice = Number((subtotal + totalTaxAmount).toFixed(2));

    const newOrder = new Order({
      userId,
      products: processedProducts,
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

    await sendEmail({
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

const fulfillOrders = async (req, res) => {
  try {
    await Order.updateMany({_id: {$in: req.body.orderIds}}, {isDeleted: true});

    res.status(200).json({message: "Orders Fulfilled"})
  } catch (error) {
    res.status(500).json({error: error.message || "Error in fulfilling Orders"})
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
  fulfillOrders
};
