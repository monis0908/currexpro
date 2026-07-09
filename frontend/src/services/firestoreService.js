import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * Generic, reusable Firestore collection wrapper.
 * Every feature service (customers, transactions, etc.) is built on top of this
 * so CRUD logic, timestamps and error handling stay consistent across the app.
 */
export function createFirestoreService(collectionName) {
  const colRef = collection(db, collectionName);

  return {
    async getAll(constraints = []) {
      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    async getById(id) {
      const ref = doc(db, collectionName, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    },

    async create(data) {
      const payload = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const ref = await addDoc(colRef, payload);
      return ref.id;
    },

    async update(id, data) {
      const ref = doc(db, collectionName, id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      return id;
    },

    async remove(id) {
      const ref = doc(db, collectionName, id);
      await deleteDoc(ref);
      return id;
    },

    subscribe(constraints = [], callback) {
      const q = query(colRef, ...constraints);
      return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    },

    // Re-exported query helpers so feature services don't need
    // to import firebase/firestore directly.
    where,
    orderBy,
    limit: fsLimit,
  };
}
