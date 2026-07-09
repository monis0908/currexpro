import { createFirestoreService } from "./firestoreService";

const base = createFirestoreService("customers");

export const customerService = {
  ...base,
  async search(term) {
    const all = await base.getAll([base.orderBy("name")]);
    if (!term) return all;
    const lower = term.toLowerCase();
    return all.filter(
      (c) =>
        c.name?.toLowerCase().includes(lower) ||
        c.phone?.includes(term) ||
        c.email?.toLowerCase().includes(lower) ||
        c.idNumber?.toLowerCase().includes(lower)
    );
  },
};
