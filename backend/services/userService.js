import { auth, db, FieldValue } from "../firebase/admin.js";
import { ApiError } from "../utils/ApiError.js";

export const userService = {
  async list() {
    const snap = await db.collection("users").get();
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  },

  async create({ name, username, email, password, role }) {
    const usernameKey = username.trim().toLowerCase();
    const usernameRef = db.collection("usernames").doc(usernameKey);

    // Reserve the username first, inside a transaction, so two admins
    // creating accounts with the same username at the same moment can't
    // both succeed — whoever's transaction commits first wins, and the
    // second attempt throws before any Firebase Auth user is created.
    await db.runTransaction(async (tx) => {
      const existing = await tx.get(usernameRef);
      if (existing.exists) {
        throw new ApiError(409, "This username is already taken. Please choose another.");
      }
      tx.set(usernameRef, { email, reserved: true });
    });

    let userRecord;
    try {
      userRecord = await auth.createUser({ email, password, displayName: name });
    } catch (err) {
      // Auth creation failed (e.g. email already in use) — release the
      // username reservation so it doesn't get stuck as unusable.
      await usernameRef.delete().catch(() => {});
      throw err;
    }

    await db.collection("users").doc(userRecord.uid).set({
      name,
      username: usernameKey,
      email,
      role,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Finalize the mapping now that we have the real uid.
    await usernameRef.set({ email, uid: userRecord.uid });

    return { uid: userRecord.uid, name, username: usernameKey, email, role };
  },

  async remove(uid) {
    const userDoc = await db.collection("users").doc(uid).get();
    const username = userDoc.exists ? userDoc.data().username : null;

    await auth.deleteUser(uid);
    await db.collection("users").doc(uid).delete();

    // Free up the username so it can be reused for a future account.
    if (username) {
      await db.collection("usernames").doc(username).delete().catch(() => {});
    }
    return { uid };
  },

  async updateRole(uid, role) {
    await db.collection("users").doc(uid).update({ role });
    return { uid, role };
  },
};