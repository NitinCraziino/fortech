const User = require("../schema/userSchema");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const {sendEmail} = require("./emailController");
const EmailTemplate = require("../schema/emailtemplateSchema");
const Product = require("../schema/productSchema");
const CustomerProduct = require("../schema/customerProductSchema");
const csv = require("csv-parser");
const fs = require("fs");
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

const toggleTaxSetting = async (req, res) => {
  try {
    const { customerId, status } = req.body;
    console.log("🚀 ~ toggleTaxSetting ~ taxEnabled:", status)

    // Find the customer by ID  
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(400).json({ error: "Customer not found" });
    }

    // Update the taxEnabled field
    customer.taxEnabled = status; 
    await customer.save();
    console.log("🚀 ~ toggleTaxSetting ~ customer:", customer)
    res.status(200).json({ message: "Tax setting updated successfully", customer });
  } catch (error) {
    console.error("Error updating tax setting:", error);
    res.status(500).json({ error: "Failed to update tax setting" });
  }
};

const createAdmin = async (req, res) => {
  try {
    const normalizedEmail = req.body.email.toLowerCase();
    // Check if the email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ error: "Email already in use." });
    }
    // Hash the password
    const hashedPassword = await hashPassword(req.body.password);
    const newUser = new User({
      name: req.body.name,
      email: normalizedEmail,
      password: hashedPassword,
      admin: true,
      active: true,
    });
    const savedUser = await newUser.save();
    res.status(200).json({ savedUser });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error creating user" });
  }
};

const inviteCustomer = async (req, res) => {
  try {
    let savedUser;

    if (req.body.customerId) {
      savedUser = await User.findById(req.body.customerId).select("-password");

      if (!savedUser) {
        return res.status(404).json({error: "Customer not found."});
      }
    } else {
      const normalizedEmail = req.body.email.toLowerCase();

      const existingUser = await User.findOne({email: normalizedEmail});
      if (existingUser) {
        return res.status(400).json({error: "Email already in use."});
      }

      const newUser = new User({
        name: req.body.customerName,
        email: normalizedEmail,
        admin: false,
        active: false,
      });

      savedUser = await newUser.save();

      if (req.file && req.file.path) {
        processCsv(req.file.path, savedUser._id);
      }
    }

    const emailTemplate = await EmailTemplate.findOne({type: "INVITE CUSTOMER"}).lean().exec();
    
    sendEmail({
      to: savedUser.email,
      from: "brian@naisupply.com",
      subject: emailTemplate.subject,
      html: emailTemplate.body
        .replace('[username]', savedUser.name)
        .replace('[SETPASSWORDLINK]', `https://www.naisorders.com/set-password/${savedUser._id}`),
    });

    res.status(200).json({ customer: savedUser });
  } catch (error) {
    res.status(500).json({error: error.message || "Error processing customer invitation"});
  }
};

const setPassword = async (req, res) => {
  try {
    // Check if the email already exists
    const hashedPassword = await hashPassword(req.body.password);
    const updatedUser = await User.findByIdAndUpdate(
      req.body.userId,
      { password: hashedPassword, active: true },
      { new: true } // Return the updated document
    );
    if (!updatedUser) {
      res.status(400).json({ error: "User not found." });
    }
    res.status(200).json({ updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error updating user" });
  }
};

const getCustomers = async (req, res) => {
  try {
    const isAdmin = req.user.admin;
    if (isAdmin) {
      const customers = await User.find({ admin: false }).sort({ createdAt: -1 }).lean().exec();
      res.status(200).json({ customers });
    } else {
      res.status(200).json({ customers: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || "Error getting customers" });
  }
};

const getCustomer = async (req, res) => {
  try {
    const isAdmin = req.user.admin;
    if (isAdmin) {
      const customer = await User.findOne({ _id: req.params.id }).lean().exec();
      res.status(200).json({ customer });
    } else {
      res.status(200).json({ customer: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || "Error getting customer" });
  }
};

const processCsv = async (filePath, customerId) => {
  try {
    const records = [];
    
    // Read CSV file and store records
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          records.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("CSV File Parsed:", records);

    for (const row of records) {
      const { partNo, unitPrice, customerPrice, productName, description, unit } = row;

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
      let product = await Product.findOne({ partNo });

      if (!product) {
        const newProduct = new Product({
          partNo,
          description,
          unit,
          unitPrice, // Store the image URL
          active: true,
          name: productName,
        });
        product = await newProduct.save(); // Create new product
        console.log(`New product added: ${productName}`);
      }

      // Add or update customer-specific product and price
      await CustomerProduct.findOneAndUpdate(
        { customerId },
        { 
          $addToSet: { 
            products: { productId: product._id, price: customerProductPrice }
          }
        },
        { new: true, upsert: true }
      );

      console.log(`Updated customer ${customerId} with product ${productName} at price ${productPrice}`);
    }
    console.log("CSV Processing Completed.");
  } catch (error) {
    console.error("Error processing CSV:", error);
  }
}

const deleteCustomerProduct = async (req, res) => {
  try {
    if(req.user.admin) {
      const updatedCustomerProduct = await CustomerProduct.findOneAndUpdate(
        { customerId: req.body.userId },
        { $pull: { products: { productId: { $in: req.body.productIds } } } }, // Remove multiple product objects
        { new: true }
      ).lean();
     res.status(200).json({updatedCustomerProduct});
    } else {
      res.status(400).json({error: "Invalid Permissions"});
    }
  } catch (error) {
    res.status(500).json({error});
  }
}

const updateCustomerNameAndEmail = async (req, res) => {
  try {
    if (!req.user.admin) return res.status(400).json({error: "Invalid Permissions"});
    const {newName, newEmail} = req.body;
    const customerId = req.params.id;

    if (typeof newName !== "string" || newName.trim() === "") {
      return res.status(400).json({error: "newName is required."});
    }

    if (typeof newEmail !== "string" || newEmail.trim() === "") {
      return res.status(400).json({error: "newEmail is required."});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({error: "Invalid email format"});
    }

    await User.findByIdAndUpdate(customerId, {
      name: newName,
      email: newEmail,
    });

    res.status(200).json({message: 'Customer name and email updated successfully'});
  } catch (error) {
    res.status(500).json({error});
  }
}

module.exports = {
  toggleTaxSetting,
  createAdmin,
  inviteCustomer,
  setPassword,
  getCustomers,
  getCustomer,
  deleteCustomerProduct,
  updateCustomerNameAndEmail
};
