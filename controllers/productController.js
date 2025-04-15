const Product = require("../schema/productSchema");
const CustomerPrice = require("../schema/customerPriceSchema");
const User = require("../schema/userSchema");
const csvParser = require("csv-parser");
const fs = require("fs");
const CustomerProduct = require("../schema/customerProductSchema");
const mongoose = require("mongoose");

const createProduct = async (req, res) => {
  try {
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const newProduct = new Product({
      partNo: req.body.partNo,
      description: req.body.description,
      unit: req.body.unit,
      unitPrice: req.body.unitPrice,
      image, // Store the image URL
      active: true,
      name: req.body.name,
    });
    const savedProduct = await newProduct.save();
    res.status(200).json({product: savedProduct});
  } catch (error) {
    res.status(500).json({error: error.message || "Error creating product."});
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const productId = req.body.productId;
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {active: req.body.active},
      {new: true} // Return the updated document
    );
    if (!updatedProduct) {
      res.status(400).json({error: "Invalid product"});
    }
    res.status(200).json({product: updatedProduct});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating product."});
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.body._id;
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    const productData = await Product.findOne({_id: productId}).lean().exec();
    if (!productData) {
      res.status(400).json({error: "Invalid product."});
    }
    const updates = {
      name: req.body.name,
      partNo: req.body.partNo,
      description: req.body.description,
      unit: req.body.unit,
      unitPrice: req.body.unitPrice,
      image: image ? image : productData.image, // Store the image URL
    };
    await Product.updateOne({_id: productId}, updates);
    res.status(200).json({message: "success"});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating product."});
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({createdAt: -1}).lean().exec();

    products.forEach(product => {
      product.taxEnabled = typeof product.taxEnabled === "boolean" ? product.taxEnabled : true;
    });
    res.status(200).json({products});
  } catch (error) {
    res.status(500).json({error: error.message || "Error getting products."});
  }
};


const getCustomerProducts = async (req, res) => {
  try {
    const customerProduct = await CustomerProduct.findOne({customerId: req.user._id})
      .populate("products.productId")
      .lean();
    if (customerProduct && customerProduct.products.length > 0) {
      const products = customerProduct.products.map((p) => ({
        ...p.productId,
        customerPrice: p.price,
        // Attach full product details
      }));
      res.status(200).json({products});
    } else {
      res.status(200).json({products: []});
    }
  } catch (error) {
    res.status(500).json({error: error.message || "Error getting products."});
  }
};

const getProductById = async (req, res) => {
  try {
    let product = await Product.findOne({_id: req.params.id}).lean().exec();
    let customerPrices = [];
    if (req.user.admin) {
      customerPrices = await CustomerPrice.find({product: product._id}).lean().exec();
    } else {
      const customerProduct = await CustomerProduct.findOne({
        customerId: req.user._id,
        "products.productId": product._id,
      })
        .populate("products.productId") // Populate product details
        .lean();
      if (customerProduct) {
        const customerPrice =
          customerProduct.products.find(
            (p) => p.productId._id.toString() === product._id.toString()
          ) || null;
        if (customerPrice) {
          product["customerPrice"] = customerPrice.price;
        }
      }
    }
    res.status(200).json({product, customerPrices});
  } catch (error) {
    res.status(500).json({error: error.message || "Error getting product."});
  }
};

const getCustomerPrices = async (req, res) => {
  try {
    const customerProduct = await CustomerProduct.findOne({customerId: req.body.userId})
      .populate("products.productId")
      .lean();
    if (customerProduct && customerProduct.products.length > 0) {
      const products = customerProduct.products.map((p) => ({
        ...p.productId,
        customerPrice: p.price,
        taxEnabled: p.taxEnabled
        // Attach full product details
      }));
      res.status(200).json({products});
    } else {
      res.status(200).json({products: []});
    }
  } catch (error) {
    res.status(500).json({error: error.message || "Error getting products."});
  }
};

const updateCustomerPrice = async (req, res) => {
  try {
    const {productId, customerId, price} = req.body;
    const product = await Product.findById(productId).lean();
    if (!product) {
      res.status(400).json({error: "Invalid product"});
    }
    const customer = await User.findById(customerId).lean();
    if (!customer) {
      res.status(400).json({error: "Invalid customer"});
    }

    const customerPrice = await CustomerProduct.findOneAndUpdate(
      {customerId, "products.productId": productId},
      {$set: {"products.$.price": price}}, // Updates price only for matching productId
      {new: true}
    ).lean();

    res.status(200).json({customerPrice});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating price."});
  }
};

const bulkUpdatePrice = async (req, res) => {
  try {
    const filePath = req.file.path;
    const updates = [];
    const customerPriceUpdate = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", async (row) => {
        const {partNo, newPrice, customerEmail, customerPrice, productName, description} = row;
        if (partNo && newPrice) {
          updates.push({partNo, newPrice: parseFloat(newPrice), productName, description});
        }
        if (customerEmail && customerPrice && partNo) {
          const user = await User.findOne({email: customerEmail.toLowerCase()});
          const product = await Product.findOne({partNo});
          if (user && product) {
            customerPriceUpdate.push({
              customer: user._id,
              product: product._id,
              price: customerPrice,
            });
          }
        }
      })
      .on("end", async () => {
        try {
          // Bulk update in the database
          for (const update of updates) {
            await Product.updateOne(
              {partNo: update.partNo},
              {
                $set: {
                  unitPrice: update.newPrice,
                  name: update.productName,
                  description: update.description,
                },
              }
            );
          }

          for (const customerPrice of customerPriceUpdate) {
            const {customer, product, price} = customerPrice;
            console.log("🚀 ~ .on ~ customer, product, price:", customer, product, price);
            await CustomerPrice.updateOne(
              {customer, product},
              {$set: {price}},
              {upsert: true}
            );
          }

          // Delete the file after processing
          fs.unlinkSync(filePath);

          res.status(200).json({
            message: `${updates.length} product prices updated successfully!`,
          });
        } catch (err) {
          console.log("🚀 ~ .on ~ err:", err);
          res.status(500).json({message: "Error updating prices", error: err});
        }
      });
  } catch (error) {
    console.log("🚀 ~ bulkUpdatePrice ~ error:", error);
    res.status(500).json({message: "Error updating prices", error: error});
  }
};

const importCustomerProducts = async (req, res) => {
  try {
    const filePath = req.file.path;
    const customerId = req.body.customerId;
    const records = [];

    // Read CSV file and store records
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          records.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("CSV File Parsed:", records);

    for (const row of records) {
      const {partNo, unitPrice, customerPrice, productName, description, unit, taxEnabled} = row;

      if (!partNo || !productName || !unitPrice) {
        console.warn("Skipping invalid row:", row);
        continue;
      }

      // Convert price to number
      const productPrice = parseFloat(unitPrice);
      const customerProductPrice = parseFloat(customerPrice);
      if (isNaN(productPrice) || isNaN(customerProductPrice)) {
        console.warn("Skipping row with invalid price:", row);
        continue;
      }

      // Check if product already exists, if not, insert it
      let product = await Product.findOne({partNo});

      if (!product) {
        const newProduct = new Product({
          partNo,
          description,
          unit,
          unitPrice, // Store the image URL
          active: true,
          name: productName
        });
        product = await newProduct.save(); // Create new product
        console.log(`New product added: ${productName}`);
      }

      const existingCustomerProduct = await CustomerProduct.findOne({
        customerId,
        "products.productId": product._id, // Check if the product already exists
      });

      if (existingCustomerProduct) {
        // Update price if product already exists
        await CustomerProduct.updateOne(
          {customerId, "products.productId": product._id},
          {$set: {"products.$.price": customerProductPrice}} // Update only the price field
        );
        console.log(`Updated price for customer ${customerId} on product ${productName}`);
      } else {
        // Add or update customer-specific product and price
        await CustomerProduct.findOneAndUpdate(
          {customerId},
          {
            $addToSet: {
              products: {
                productId: product._id,
                price: customerProductPrice,
                taxEnabled: taxEnabled ? taxEnabled : false
              },
            },
          },
          {new: true, upsert: true}
        );
        console.log(
          `Updated customer ${customerId} with product ${productName} at price ${productPrice}`
        );
      }
    }
    console.log("CSV Processing Completed.");
    res.status(200).json("success");
  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).json({error});
  }
};

const assignProductsToCustomers = async (req, res) => {
  try {
    const {assignments} = req.body;

    // Validate input
    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({error: "Invalid assignments data"});
    }

    // Get unique product and customer IDs
    const productIds = [...new Set(assignments.map(a => a.productId))];
    const customerIds = [...new Set(assignments.map(a => a.customerId))];

    // Verify all products exist
    const products = await Product.find({
      _id: {$in: productIds}
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({error: "One or more products not found"});
    }

    // Verify all customers exist and are not admins
    const customers = await User.find({
      _id: {$in: customerIds},
      admin: false
    });

    if (customers.length !== customerIds.length) {
      return res.status(400).json({error: "One or more customers not found, or are admins"});
    }

    // Process each assignment
    const bulkOps = [];

    for (const assignment of assignments) {
      const customerProductsDoc = await CustomerProduct.findOne({
        customerId: assignment.customerId
      });

      if (customerProductsDoc) {
        const existingProductIndex = customerProductsDoc.products.findIndex(
          p => p.productId.toString() === assignment.productId
        );

        if (existingProductIndex >= 0) {
          // Update the price of existing product assignment
          bulkOps.push({
            updateOne: {
              filter: {
                customerId: assignment.customerId,
                "products.productId": new mongoose.Types.ObjectId(assignment.productId)
              },
              update: {
                $set: {
                  "products.$.price": assignment.price
                }
              }
            }
          });
        } else {
          // Add new product to existing customer
          bulkOps.push({
            updateOne: {
              filter: {customerId: assignment.customerId},
              update: {
                $push: {
                  products: {
                    productId: assignment.productId,
                    price: assignment.price
                  }
                }
              }
            }
          });
        }
      }
    }

    // Execute bulk operations if there are any
    if (bulkOps.length > 0) {
      await CustomerProduct.bulkWrite(bulkOps);
    }

    res.status(200).json({message: "Products assigned successfully"});
  } catch (error) {
    console.error("Error assigning products to customers:", error);
    res.status(500).json({error: "Failed to assign products to customers"});
  }
};


const toggleProductTaxStatus = async (req, res) => {
  try {
    console.log("🚀 ~ toggleProductTaxStatus ~ req.body:", req.body);
    const {productId, taxEnabled} = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {taxEnabled},
      {new: true}
    );

    if (!updatedProduct) {
      return res.status(400).json({error: "Invalid product"});
    }

    res.status(200).json({product: updatedProduct});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating product tax status."});
  }
};

// Add this function to toggle tax status for a customer-specific product
const toggleCustomerProductTaxStatus = async (req, res) => {
  try {
    const {customerId, productId, taxEnabled} = req.body;

    const customerProduct = await CustomerProduct.findOneAndUpdate(
      {
        customerId,
        "products.productId": productId
      },
      {
        $set: {"products.$.taxEnabled": taxEnabled}
      },
      {new: true}
    );

    if (!customerProduct) {
      return res.status(400).json({error: "Customer product not found"});
    }

    res.status(200).json({customerProduct});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating customer product tax status."});
  }
};

module.exports = {
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
  toggleCustomerProductTaxStatus,
  toggleProductTaxStatus
};
