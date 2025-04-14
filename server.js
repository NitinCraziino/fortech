require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const passport = require("passport");
require("./config/passport-local"); // Local strategy
require("./config/passport-jwt");
const authRoutes = require("./routes/authRoute");
const productRoutes = require("./routes/productRoute");
const orderRoutes = require("./routes/orderRoute");
const userRoutes = require("./routes/userRoute");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json());
const corsOptions = {
  origin: [
    "http://3.109.19.145",
    "http://localhost:5173",
    "https://naisorders.com",
    "https://www.naisorders.com",
  ], // Allow only your React app
  methods: "*", // Allowed HTTP methods
  allowedHeaders: "*", // Allowed headers
  credentials: true, // Allow credentials (cookies, sessions, tokens)
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(passport.initialize());
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/order", orderRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
