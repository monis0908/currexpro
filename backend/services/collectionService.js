import { db, FieldValue } from "../firebase/admin.js";

/**
 * Generic Firestore collection helper shared by every resource service.
 * Keeps CRUD logic and timestamp handling consistent across the API.
 */
export function createCollectionService(collectionName) {
  const col = db.collection(collectionName);

  return {
    async getAll({ where = [], orderBy, limit } = {}) {
      let q = col;
      where.forEach(([field, op, value]) => {
        q = q.where(field, op, value);
      });
      if (orderBy) q = q.orderBy(orderBy.field, orderBy.direction || "asc");
      if (limit) q = q.limit(limit);
      const snap = await q.get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    async getById(id) {
      const doc = await col.doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    },

    async create(data) {
      const payload = {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      const ref = await col.add(payload);
      return ref.id;
    },

    async update(id, data) {
      await col.doc(id).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
      return id;
    },

    async remove(id) {
      await col.doc(id).delete();
      return id;
    },

    raw: col,
  };
}
