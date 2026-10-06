import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Credential resolution ─────────────────────────────────────────────────
// Option A (local dev): GOOGLE_APPLICATION_CREDENTIALS points to a JSON file
// Option B (cloud/CI):  Individual FIREBASE_* env vars
function resolveCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Resolve relative path from the project root (where server.js lives)
    const absolutePath = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const serviceAccount = JSON.parse(readFileSync(absolutePath, "utf8"));
    return cert(serviceAccount);
  }

  if (process.env.FIREBASE_PROJECT_ID) {
    return cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Hosted env vars replace literal \n — this restores them
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    });
  }

  throw new Error(
    "Firebase credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID in your .env file."
  );
}

if (!getApps().length) {
  initializeApp({ credential: resolveCredential() });
}

export const auth = getAuth();
export const db = getFirestore();
export { FieldValue };