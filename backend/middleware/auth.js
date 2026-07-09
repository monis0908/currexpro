import { auth, db } from "../firebase/admin.js";

/**
 * Verifies the Firebase ID token sent in the Authorization header and
 * attaches the caller's uid, email and Firestore role to req.user.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Missing authentication token." });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    const profileSnap = await db.collection("users").doc(decoded.uid).get();
    const role = profileSnap.exists ? profileSnap.data().role : "cashier";

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role,
      name: profileSnap.exists ? profileSnap.data().name || decoded.email : decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}
