/**
 * One-time bootstrap script: creates the first admin account.
 * Run with:  node scripts/seedAdmin.js "Owner Name" owner@business.com "StrongPass123"
 *
 * After this, sign in on the frontend and use Settings > Users to add
 * managers and cashiers through the normal admin UI.
 */
import { auth, db, FieldValue } from "../firebase/admin.js";

const [, , name, email, password] = process.argv;

if (!name || !email || !password) {
  console.error('Usage: node scripts/seedAdmin.js "Full Name" email@business.com "Password123"');
  process.exit(1);
}

async function run() {
  const userRecord = await auth.createUser({ email, password, displayName: name });

  await db.collection("users").doc(userRecord.uid).set({
    name,
    email,
    role: "admin",
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`Admin account created for ${email} (uid: ${userRecord.uid}).`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Failed to create admin account:", err.message);
  process.exit(1);
});
