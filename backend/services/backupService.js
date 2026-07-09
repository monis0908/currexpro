import { db } from "../firebase/admin.js";

const COLLECTIONS = [
  "customers",
  "transactions",
  "currencyRates",
  "bankAccounts",
  "cashTransactions",
  "activityLogs",
  "settings",
];

export const backupService = {
  async exportAll() {
    const result = {};
    for (const name of COLLECTIONS) {
      const snap = await db.collection(name).get();
      result[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    result.exportedAt = new Date().toISOString();
    return result;
  },
};
