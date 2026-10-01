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
    const inStock = req.body.inStock !== undefined ? req.body.inStock === 'true' : true;
    const productData = {
      partNo: req.body.partNo,
      description: req.body.description,
      unit: req.body.unit,
      unitPrice: req.body.unitPrice,
      image, // Store the image URL
      active: true,
      name: req.body.name,
      inStock: inStock,
    };
    // Part numbers are unique, and a deleted product still holds its part
    // number. Creating that part number again restores the deleted product
    // with the new details instead of failing as a duplicate.
    const deletedProduct = await Product.findOne({partNo: req.body.partNo, isDeleted: true});
    let savedProduct;
    if (deletedProduct) {
      deletedProduct.set({...productData, taxEnabled: true, isDeleted: false});
      savedProduct = await deletedProduct.save();
      // Treat it as newly created so it sorts to the top of the product list
      // (createdAt is immutable through Mongoose, so set it directly).
      await Product.collection.updateOne({_id: savedProduct._id}, {$set: {createdAt: new Date()}});
      savedProduct = await Product.findById(savedProduct._id);
    } else {
      savedProduct = await new Product(productData).save();
    }
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
    if (req.body.inStock !== undefined) {
      updates.inStock = req.body.inStock === 'true';
    }
    await Product.updateOne({_id: productId}, updates);
    res.status(200).json({message: "success"});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating product."});
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({isDeleted: {$ne: true}}).sort({createdAt: -1}).lean().exec();
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
    // req.user is loaded fresh from the DB on every request (passport-jwt), so
    // this always reflects the customer's current tax setting — the client uses
    // this instead of the value saved at login (which can go stale).
    const customerTax = {
      taxEnabled: req.user.taxEnabled === true,
      taxAmount: req.user.taxAmount || 0,
    };

    const customerProduct = await CustomerProduct.findOne({customerId: req.user._id})
      .populate("products.productId")
      .lean();
    if (customerProduct && customerProduct.products.length > 0) {
      const products = customerProduct.products.map((p) => ({
        ...p.productId,
        customerPrice: p.price,
        taxEnabled: p.taxEnabled,
        isFavorite: p.isFavorite || false,
        inStock: p.productId.inStock !== undefined ? p.productId.inStock : true,
        // Attach full product details
      }))
        .sort((a, b) => {
          // Sort favorites first (true comes before false)
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return 0;
        });

      res.status(200).json({products, customerTax});
    } else {
      res.status(200).json({products: [], customerTax});
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
        taxEnabled: typeof p.taxEnabled === 'boolean' ? p.taxEnabled : true
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
      } else if (product.isDeleted) {
        // Importing the part number of a deleted product restores it. Only
        // overwrite the fields the CSV row provides.
        const restored = {name: productName, unitPrice, active: true, taxEnabled: true, isDeleted: false};
        if (description) restored.description = description;
        if (unit) restored.unit = unit;
        product.set(restored);
        product = await product.save();
        console.log(`Deleted product restored: ${productName}`);
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
      _id: {$in: productIds},
      isDeleted: {$ne: true}
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({error: "One or more products not found"});
    }

    // Verify all customers exist and are not admins
    const customers = await User.find({
      _id: {$in: customerIds},
      admin: false,
      isDeleted: {$ne: true}
    });

    if (customers.length !== customerIds.length) {
      return res.status(400).json({error: "One or more customers not found, or are admins"});
    }

    // Process each assignment
    const bulkOps = [];
    const newCustomerProducts = new Map(); // Track new customers to avoid duplicates

    for (const assignment of assignments) {
      const customerProductsDoc = await CustomerProduct.findOne({
        customerId: assignment.customerId
      });

      // Ensure taxEnabled is properly set - default to product's taxEnabled setting if not specified
      const taxEnabled = typeof assignment.taxEnabled === "boolean" ? assignment.taxEnabled : true;

      if (customerProductsDoc) {
        const existingProductIndex = customerProductsDoc.products.findIndex(
          p => p.productId.toString() === assignment.productId
        );

        if (existingProductIndex >= 0) {
          // Update the price and taxEnabled status of existing product assignment
          bulkOps.push({
            updateOne: {
              filter: {
                customerId: assignment.customerId,
                "products.productId": new mongoose.Types.ObjectId(assignment.productId)
              },
              update: {
                $set: {
                  "products.$.price": assignment.price,
                  "products.$.taxEnabled": taxEnabled
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
                    price: assignment.price,
                    taxEnabled: taxEnabled  // Added taxEnabled property
                  }
                }
              }
            }
          });
        }
      } else {
        // Handle new customer - collect all products for this customer first
        if (!newCustomerProducts.has(assignment.customerId)) {
          newCustomerProducts.set(assignment.customerId, []);
        }
        newCustomerProducts.get(assignment.customerId).push({
          productId: assignment.productId,
          price: assignment.price,
          taxEnabled: taxEnabled
        });
      }
    }

    // Create operation for new customers with all their products
    for (const [customerId, products] of newCustomerProducts) {
      bulkOps.push({
        insertOne: {
          document: {
            customerId: customerId,
            products: products
          }
        }
      });
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

const toggleProductStockStatus = async (req, res) => {
  try {
    const {productId, inStock} = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {inStock},
      {new: true}
    );

    if (!updatedProduct) {
      return res.status(400).json({error: "Invalid product"});
    }

    res.status(200).json({product: updatedProduct});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating product stock status."});
  }
};

const bulkToggleProductStockStatus = async (req, res) => {
  try {
    const {productIds, inStock} = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({error: "Invalid product IDs"});
    }

    if (typeof inStock !== "boolean") {
      return res.status(400).json({error: "Invalid stock status value"});
    }

    const result = await Product.updateMany(
      {_id: {$in: productIds}},
      {$set: {inStock}}
    );

    res.status(200).json({
      message: `${result.modifiedCount} products stock status updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error bulk updating stock status:", error);
    res.status(500).json({error: error.message || "Error updating products stock status."});
  }
};

// Soft-delete a product: hide it from the product list and remove it from
// every customer's item list. The record stays so past orders still show the
// product's name and part number.
const deleteProduct = async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(400).json({error: "Invalid Permissions"});
    }

    const product = await Product.findOneAndUpdate(
      {_id: req.params.productId, isDeleted: {$ne: true}},
      {isDeleted: true, active: false},
      {new: true}
    );

    if (!product) {
      return res.status(400).json({error: "Invalid product"});
    }

    await CustomerProduct.updateMany(
      {"products.productId": product._id},
      {$pull: {products: {productId: product._id}}}
    );

    res.status(200).json({message: "Product deleted successfully"});
  } catch (error) {
    res.status(500).json({error: error.message || "Error deleting product."});
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

// Toggle favorite status for a single customer-specific product
const toggleCustomerProductFavoriteStatus = async (req, res) => {
  try {
    const {customerId, productId, isFavorite} = req.body;

    const customerProduct = await CustomerProduct.findOneAndUpdate(
      {
        customerId,
        "products.productId": productId
      },
      {
        $set: {"products.$.isFavorite": isFavorite}
      },
      {new: true}
    );

    if (!customerProduct) {
      return res.status(400).json({error: "Customer product not found"});
    }

    res.status(200).json({customerProduct});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating customer product favorite status."});
  }
};

// Bulk toggle favorite status for multiple customer-specific products
const bulkToggleCustomerProductFavoriteStatus = async (req, res) => {
  try {
    const {customerId, productUpdates} = req.body;

    // Validate input
    if (!productUpdates || !Array.isArray(productUpdates)) {
      return res.status(400).json({error: "Invalid product updates data"});
    }

    // Verify customer exists and is not admin
    const customer = await User.findOne({
      _id: customerId,
      admin: false
    });

    if (!customer) {
      return res.status(400).json({error: "Customer not found or is admin"});
    }

    // Process bulk operations
    const bulkOps = [];

    for (const update of productUpdates) {
      const {productId, isFavorite} = update;

      // Ensure isFavorite is properly set - default to true if not specified
      const favoriteStatus = typeof isFavorite === "boolean" ? isFavorite : true;

      bulkOps.push({
        updateOne: {
          filter: {
            customerId,
            "products.productId": new mongoose.Types.ObjectId(productId)
          },
          update: {
            $set: {
              "products.$.isFavorite": favoriteStatus
            }
          }
        }
      });
    }

    // Execute bulk operations if there are any
    if (bulkOps.length > 0) {
      const result = await CustomerProduct.bulkWrite(bulkOps);

      res.status(200).json({
        message: `${result.modifiedCount} products favorite status updated successfully`,
        result
      });
    } else {
      res.status(400).json({error: "No valid product updates provided"});
    }

  } catch (error) {
    console.error("Error bulk updating favorite status:", error);
    res.status(500).json({error: error.message || "Error updating customer product favorite status."});
  }
};


// Which customers have this product on their item list, and at what price.
// Used by the "Change prices" popup on the Products page so the admin can
// see the current price per customer before changing it.
const getProductCustomerPrices = async (req, res) => {
  try {
    if (!req.user.admin) return res.status(400).json({error: "Invalid Permissions"});

    const {productId} = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({error: "Invalid product"});
    }

    const docs = await CustomerProduct.find({"products.productId": productId})
      .select("customerId products.productId products.price")
      .lean();

    const prices = docs.map((doc) => {
      const row = doc.products.find((p) => p.productId.toString() === productId);
      return {customerId: doc.customerId, price: row ? row.price : null};
    });

    res.status(200).json({prices});
  } catch (error) {
    res.status(500).json({error: error.message || "Error getting customer prices."});
  }
};

// Change one product's customer price for many customers at once.
// mode "fixed": every selected customer gets price = value.
// mode "percent": every selected customer's current price changes by value %
// (e.g. 5 = +5%, -10 = -10%). Customers who do not have the product on their
// list are skipped and reported back, nothing is added to their list.
const bulkUpdateCustomerPrices = async (req, res) => {
  try {
    if (!req.user.admin) return res.status(400).json({error: "Invalid Permissions"});

    const {productId, customerIds, mode} = req.body;
    const value = Number(req.body.value);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({error: "Invalid product"});
    }
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({error: "Select at least one customer"});
    }
    if (!customerIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({error: "Invalid customer"});
    }
    if (mode !== "fixed" && mode !== "percent") {
      return res.status(400).json({error: "mode must be 'fixed' or 'percent'"});
    }
    if (!Number.isFinite(value)) {
      return res.status(400).json({error: "Enter a valid number"});
    }
    if (mode === "fixed" && value < 0) {
      return res.status(400).json({error: "Price cannot be negative"});
    }
    if (mode === "percent" && value <= -100) {
      return res.status(400).json({error: "Percentage must be greater than -100"});
    }

    const product = await Product.findOne({_id: productId, isDeleted: {$ne: true}}).lean();
    if (!product) {
      return res.status(400).json({error: "Product not found"});
    }

    const customers = await User.find({
      _id: {$in: customerIds},
      admin: false,
      isDeleted: {$ne: true},
    }).select("name").lean();
    if (customers.length !== new Set(customerIds.map(String)).size) {
      return res.status(400).json({error: "One or more customers not found"});
    }
    const nameById = Object.fromEntries(customers.map((c) => [c._id.toString(), c.name]));

    const docs = await CustomerProduct.find({
      customerId: {$in: customerIds},
      "products.productId": productId,
    }).lean();

    const ops = [];
    const updated = [];
    for (const doc of docs) {
      const row = doc.products.find((p) => p.productId.toString() === productId);
      if (!row) continue;
      const oldPrice = Number(row.price) || 0;
      const newPrice = mode === "fixed"
        ? Number(value.toFixed(2))
        : Number((oldPrice * (1 + value / 100)).toFixed(2));
      ops.push({
        updateOne: {
          filter: {_id: doc._id, "products.productId": row.productId},
          update: {$set: {"products.$.price": newPrice}},
        },
      });
      updated.push({customerId: doc.customerId, name: nameById[doc.customerId.toString()], oldPrice, newPrice});
    }
    if (ops.length) await CustomerProduct.bulkWrite(ops);

    const updatedIds = new Set(updated.map((u) => u.customerId.toString()));
    const skipped = customerIds
      .filter((id) => !updatedIds.has(String(id)))
      .map((id) => ({customerId: id, name: nameById[String(id)]}));

    res.status(200).json({updated, skipped});
  } catch (error) {
    res.status(500).json({error: error.message || "Error updating prices."});
  }
};

module.exports = {
  getProductCustomerPrices,
  bulkUpdateCustomerPrices,
  createProduct,
  deleteProduct,
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
  toggleProductTaxStatus,
  toggleProductStockStatus,
  bulkToggleProductStockStatus,
  toggleCustomerProductFavoriteStatus,
  bulkToggleCustomerProductFavoriteStatus,
  toggleCustomerProductFavoriteStatus
};
