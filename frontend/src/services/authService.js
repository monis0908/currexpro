import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

// Simple check to tell a typed email apart from a typed username.
function isEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export const authService = {
  /**
   * Looks up the email address linked to a username via the
   * `usernames` collection (doc id = lowercased username, field: email).
   * Returns null if no such username exists.
   */
  async getEmailForUsername(username) {
    const ref = doc(db, "usernames", username.trim().toLowerCase());
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().email : null;
  },

  /**
   * Returns true if the username is NOT already taken.
   * Used when creating a new user, to validate uniqueness before writing.
   */
  async isUsernameAvailable(username) {
    const ref = doc(db, "usernames", username.trim().toLowerCase());
    const snap = await getDoc(ref);
    return !snap.exists();
  },

  /**
   * Logs in with either an email or a username, using the same password.
   * If `identifier` looks like an email, it's used directly (unchanged
   * behavior). Otherwise it's resolved to an email via the `usernames`
   * collection first, then signed in normally.
   */
  async login(identifier, password) {
    let email = identifier.trim();

    if (!isEmail(email)) {
      const resolvedEmail = await this.getEmailForUsername(email);
      if (!resolvedEmail) {
        // Mimic Firebase's own error shape so existing error handling
        // (e.g. mapAuthError in AuthContext) still works unchanged.
        const err = new Error("No account found for this username.");
        err.code = "auth/user-not-found";
        throw err;
      }
      email = resolvedEmail;
    }

    await setPersistence(auth, browserSessionPersistence);

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await this.getUserProfile(cred.user.uid);
    return { uid: cred.user.uid, email: cred.user.email, ...profile };
  },

  async logout() {
    await signOut(auth);
  },

  async getUserProfile(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { role: "cashier", name: auth.currentUser?.email || "User" };
    }
    return snap.data();
  },

  onChange(callback) {
    return onAuthStateChanged(auth, callback);
  },
};

