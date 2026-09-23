/**
 * Delete test customers and everything linked to them.
 *
 * SAFE BY DEFAULT: without --confirm this only prints what it WOULD delete.
 * Admin accounts are never deleted, even if they match.
 *
 *   node scripts/deleteTestCustomers.js                        # dry run (domain: mailinator.com)
 *   node scripts/deleteTestCustomers.js --domain example.com   # dry run, different domain
 *   node scripts/deleteTestCustomers.js --emails a@x.com,b@y.com
 *   node scripts/deleteTestCustomers.js --confirm              # actually delete (writes a backup first)
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const args = process.argv.slice(2);
const getFlag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null;
};
const confirm = args.includes("--confirm");
const domain = getFlag("domain") || "mailinator.com";
const emails = (getFlag("emails") || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

(async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // Show which database is about to be touched - guards against pointing at prod by accident.
  console.log(`Database: ${db.databaseName}`);
  console.log(confirm ? "Mode: DELETE (--confirm given)\n" : "Mode: DRY RUN (nothing will be deleted)\n");

  // Build the selector. Admins are excluded at the query level.
  const selector = emails.length
    ? { email: { $in: emails }, admin: { $ne: true } }
    : { email: { $regex: `@${domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }, admin: { $ne: true } };

  console.log(emails.length ? `Matching ${emails.length} listed email(s)` : `Matching emails ending in @${domain}`);

  const users = await db.collection("users").find(selector).toArray();
  if (!users.length) {
    console.log("\nNo matching customers found. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  const userIds = users.map((u) => u._id);

  // Everything that points back at these customers.
  const related = {
    orders: await db.collection("orders").find({ userId: { $in: userIds } }).toArray(),
    customerproducts: await db.collection("customerproducts").find({ customerId: { $in: userIds } }).toArray(),
    customerprices: await db.collection("customerprices").find({ customer: { $in: userIds } }).toArray(),
  };

  console.log(`\nCustomers to delete (${users.length}):`);
  for (const u of users) {
    const orders = related.orders.filter((o) => String(o.userId) === String(u._id)).length;
    const cp = related.customerproducts.filter((d) => String(d.customerId) === String(u._id)).length;
    const cpr = related.customerprices.filter((d) => String(d.customer) === String(u._id)).length;
    console.log(`  - ${u.name} <${u.email}>  active=${!!u.active}  orders=${orders} customerProducts=${cp} customerPrices=${cpr}`);
  }

  console.log("\nLinked records to delete:");
  console.log(`  orders:           ${related.orders.length}`);
  console.log(`  customerproducts: ${related.customerproducts.length}`);
  console.log(`  customerprices:   ${related.customerprices.length}`);
  console.log("\nNote: shared products in the `products` collection are NOT touched.");

  if (!confirm) {
    console.log("\nDry run complete. Re-run with --confirm to delete the above.");
    await mongoose.disconnect();
    return;
  }

  // Write a backup of everything being removed, so this is recoverable.
  const backupDir = path.join(__dirname, "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `deleted-customers-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(backupFile, JSON.stringify({ users, ...related }, null, 2));
  console.log(`\nBackup written: ${backupFile}`);

  const r1 = await db.collection("orders").deleteMany({ userId: { $in: userIds } });
  const r2 = await db.collection("customerproducts").deleteMany({ customerId: { $in: userIds } });
  const r3 = await db.collection("customerprices").deleteMany({ customer: { $in: userIds } });
  const r4 = await db.collection("users").deleteMany({ _id: { $in: userIds }, admin: { $ne: true } });

  console.log("\nDeleted:");
  console.log(`  orders:           ${r1.deletedCount}`);
  console.log(`  customerproducts: ${r2.deletedCount}`);
  console.log(`  customerprices:   ${r3.deletedCount}`);
  console.log(`  users:            ${r4.deletedCount}`);

  await mongoose.disconnect();
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
