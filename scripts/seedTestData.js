/**
 * Seed a TEST database with an admin, customers, products, customer item
 * lists, email templates and a few orders, so the portal can be tested.
 *
 *   node scripts/seedTestData.js            # seed an empty database
 *   node scripts/seedTestData.js --reset    # wipe the database first, then seed
 *
 * Safety: refuses to run unless the database name contains "test"
 * (pass --force to override). Everyone gets the same password, shown at the end.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const PASSWORD = "Test@1234";
const TAX_RATE = 0.06; // per-product tax rate used by orderController

const args = process.argv.slice(2);
const reset = args.includes("--reset");
const force = args.includes("--force");

const ADMIN = { name: "Test Admin", email: "admin@nais-test.com" };

// Mailinator inboxes are public and need no setup, so invite / order emails
// can be read at https://www.mailinator.com (inbox = part before the @).
const CUSTOMERS = [
  { key: "acme", name: "Acme Fabrication", email: "nais-acme@mailinator.com", active: true },
  { key: "bolt", name: "Bolt & Nut Co", email: "nais-bolt@mailinator.com", active: true },
  { key: "crest", name: "Crest Plumbing", email: "nais-crest@mailinator.com", active: true, taxEnabled: true, taxAmount: 7 },
  { key: "pending", name: "Pending Customer", email: "nais-pending@mailinator.com", active: false },
];

const PRODUCTS = [
  { partNo: "HEX-M10-50", name: "Hex Bolt M10 x 50mm", unit: "BOX", unitPrice: 24.5, description: "Zinc plated, box of 100" },
  { partNo: "NUT-M10", name: "Hex Nut M10", unit: "BOX", unitPrice: 9.75, description: "Zinc plated, box of 200" },
  { partNo: "WSH-M10", name: "Flat Washer M10", unit: "BOX", unitPrice: 6.2, description: "Box of 500" },
  { partNo: "GLV-NIT-L", name: "Nitrile Gloves Large", unit: "CASE", unitPrice: 48, description: "Case of 10 boxes", taxEnabled: false },
  { partNo: "TAPE-PTFE", name: "PTFE Thread Tape", unit: "EA", unitPrice: 1.85, description: "12mm x 12m roll" },
  { partNo: "PIPE-CU-15", name: "Copper Pipe 15mm", unit: "EA", unitPrice: 18.4, description: "3m length" },
  { partNo: "DRL-SET-19", name: "HSS Drill Bit Set", unit: "EA", unitPrice: 32.9, description: "19 piece, 1-10mm" },
  { partNo: "SAW-BLD-10", name: "Circular Saw Blade 10in", unit: "EA", unitPrice: 41, description: "40 tooth", inStock: false },
  { partNo: "WD40-400", name: "WD-40 400ml", unit: "EA", unitPrice: 7.5, description: "Multi-use spray", taxEnabled: false },
  { partNo: "SAFE-GLS", name: "Safety Glasses", unit: "EA", unitPrice: 4.25, description: "Clear, anti-fog", active: false },
];

// Items on each customer's list: [partNo, customer price, taxEnabled, isFavorite]
const ITEMS = {
  acme: [["HEX-M10-50", 22, true, true], ["NUT-M10", 9, true, false], ["WSH-M10", 5.5, true, false], ["GLV-NIT-L", 45, false, false], ["DRL-SET-19", 30, true, false], ["SAW-BLD-10", 39, true, false]],
  bolt: [["HEX-M10-50", 23.5, true, false], ["NUT-M10", 9.5, true, true], ["WD40-400", 7, false, false], ["TAPE-PTFE", 1.6, true, false]],
  crest: [["PIPE-CU-15", 17, false, true], ["TAPE-PTFE", 1.5, false, false], ["WD40-400", 7.25, false, false]],
};

// Orders: customer, items [partNo, qty], status, extras
const ORDERS = [
  { customer: "acme", items: [["HEX-M10-50", 4], ["NUT-M10", 4]], status: "Fulfilled", pickupLocation: "Warehouse A", poNumber: "PO-1001", deliveryDate: "2026-09-20", daysAgo: 12 },
  { customer: "acme", items: [["GLV-NIT-L", 2], ["DRL-SET-19", 1]], status: "Processing", pickupLocation: "Warehouse A", poNumber: "PO-1002", deliveryDate: "2026-10-06", daysAgo: 2 },
  { customer: "bolt", items: [["WD40-400", 10], ["TAPE-PTFE", 20]], status: "Processing", pickupLocation: "Front Desk", poNumber: "PO-2001", comments: "Call on arrival", daysAgo: 1 },
  { customer: "crest", items: [["PIPE-CU-15", 6], ["WD40-400", 2]], status: "Fulfilled", pickupLocation: "Dock 2", poNumber: "PO-3001", daysAgo: 5 },
];

const html = (title, lines) => `<div style="font-family:Arial,sans-serif;color:#203b54"><h2>${title}</h2>${lines.map((l) => `<p>${l}</p>`).join("")}<p>Regards,<br/>NAIS Team</p></div>`;
const TEMPLATES = [
  { type: "INVITE CUSTOMER", subject: "You're invited to the NAIS order portal", body: html("Welcome [username]", ["You have been invited to the NAIS order portal.", '<a href="[SETPASSWORDLINK]">Set your password</a>']) },
  { type: "ORDER CONFIRMATION", subject: "Your order [order id] has been received", body: html("Thank you [username]", ["Order [order id] for $[amount] was received on [order date & time].", '<a href="[vieworderlink]">View order</a>']) },
  { type: "NEW ORDER", subject: "New order [order id] from [customer name]", body: html("Hello [username]", ["[customer name] placed order [order id] for $[amount] on [order date & time].", '<a href="[vieworderlink]">View order</a>']) },
  { type: "Forgot Password", subject: "Reset your NAIS portal password", body: html("Hello [username]", ["You requested a password reset.", '<a href="[resetpasswordlink]">Reset password</a>']) },
];

const round2 = (n) => Number(n.toFixed(2));
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

(async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  console.log(`Database: ${db.databaseName}`);

  if (!/test/i.test(db.databaseName) && !force) {
    throw new Error(`Database name does not contain "test". Refusing to seed. Pass --force if you really mean it.`);
  }

  const col = (n) => db.collection(n);
  if (reset) {
    for (const name of ["users", "products", "customerproducts", "customerprices", "orders", "emailtemplates"]) {
      const r = await col(name).deleteMany({});
      console.log(`  cleared ${name} (${r.deletedCount})`);
    }
  } else if (await col("users").countDocuments()) {
    throw new Error("Database already has users. Re-run with --reset to wipe and reseed.");
  }

  const now = new Date();
  const stamp = (doc, d = now) => ({ ...doc, createdAt: d, updatedAt: d, __v: 0 });
  const hash = await bcrypt.hash(PASSWORD, 10);

  // Email templates (inserted directly so placeholder casing is preserved)
  await col("emailtemplates").insertMany(TEMPLATES.map((t) => stamp({ ...t, active: true })));

  // Users
  const adminDoc = stamp({ ...ADMIN, password: hash, admin: true, active: true, taxEnabled: false, taxAmount: 0, isDeleted: false });
  await col("users").insertOne(adminDoc);
  const customerIds = {};
  for (const c of CUSTOMERS) {
    const doc = stamp({ name: c.name, email: c.email, admin: false, active: c.active, taxEnabled: !!c.taxEnabled, taxAmount: c.taxAmount || 0, isDeleted: false, ...(c.active ? { password: hash } : {}) });
    const r = await col("users").insertOne(doc);
    customerIds[c.key] = r.insertedId;
  }

  // Products (spread createdAt so the list has a stable order)
  const productIds = {};
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const doc = stamp({ ...p, image: null, active: p.active !== false, taxEnabled: p.taxEnabled !== false, inStock: p.inStock !== false, isDeleted: false }, daysAgo(30 - i));
    const r = await col("products").insertOne(doc);
    productIds[p.partNo] = r.insertedId;
  }

  // Customer item lists
  for (const [key, items] of Object.entries(ITEMS)) {
    await col("customerproducts").insertOne(stamp({
      customerId: customerIds[key],
      products: items.map(([partNo, price, taxEnabled, isFavorite]) => ({ productId: productIds[partNo], price, taxEnabled, isFavorite, _id: new mongoose.Types.ObjectId() })),
    }));
  }

  // Orders, priced the same way orderController.createOrder does it
  const customerByKey = Object.fromEntries(CUSTOMERS.map((c) => [c.key, c]));
  for (const o of ORDERS) {
    const cust = customerByKey[o.customer];
    const customerRate = cust.taxEnabled ? (cust.taxAmount || 0) / 100 : 0;
    let subtotal = 0, tax = 0;
    const products = o.items.map(([partNo, quantity]) => {
      const item = ITEMS[o.customer].find((i) => i[0] === partNo);
      const price = item[1];
      let taxEnabled = false, rate = 0, taxSource = "";
      if (item[2]) { taxEnabled = true; rate = TAX_RATE; taxSource = "Product"; }
      else if (cust.taxEnabled) { taxEnabled = true; rate = customerRate; taxSource = "Customer"; }
      const amount = price * quantity;
      const taxAmount = taxEnabled ? round2(amount * rate) : 0;
      subtotal += amount; tax += taxAmount;
      return { productId: productIds[partNo], quantity, price, taxEnabled, amount, taxAmount, taxSource, _id: new mongoose.Types.ObjectId() };
    });
    await col("orders").insertOne(stamp({
      orderNo: require("crypto").randomBytes(6).toString("hex").toUpperCase(),
      products, userId: customerIds[o.customer], pickupLocation: o.pickupLocation,
      taxAmount: round2(tax), totalPrice: round2(subtotal + tax),
      comments: o.comments, poNumber: o.poNumber, deliveryDate: o.deliveryDate, isDeleted: false, status: o.status,
    }, daysAgo(o.daysAgo)));
  }

  console.log("\nSeeded:");
  console.log(`  admin:      ${ADMIN.email}`);
  for (const c of CUSTOMERS) console.log(`  customer:   ${c.email}  (${c.name}${c.active ? "" : ", invited but not active"})`);
  console.log(`  products:   ${PRODUCTS.length}`);
  console.log(`  orders:     ${ORDERS.length}`);
  console.log(`  templates:  ${TEMPLATES.length}`);
  console.log(`\nPassword for the admin and every active customer: ${PASSWORD}`);
  console.log("The pending customer has no password; use the invite/set-password flow.");

  await mongoose.disconnect();
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
