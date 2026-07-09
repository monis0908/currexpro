import { db, FieldValue } from "../firebase/admin.js";
import { createCollectionService } from "./collectionService.js";

const accounts = createCollectionService("bankAccounts");
const cashTx = createCollectionService("cashTransactions");

export const bankService = {
  ...accounts,

  async listByType(type) {
    return accounts.getAll({ where: [["type", "==", type]], orderBy: { field: "name" } });
  },

  async getHistory(accountId) {
    return cashTx.getAll({
      where: [["accountId", "==", accountId]],
      orderBy: { field: "createdAt", direction: "desc" },
    });
  },

  async adjustBalance(accountId, amount, type, note = "", createdBy = "system") {
    const ref = db.collection("bankAccounts").doc(accountId);
    await db.runTransaction(async (t) => {
      const snap = await t.get(ref);
      if (!snap.exists) throw Object.assign(new Error("Account not found"), { status: 404 });
      const current = snap.data().balance || 0;
      const next = type === "withdraw" ? current - amount : current + amount;
      t.update(ref, { balance: next, updatedAt: FieldValue.serverTimestamp() });
    });

    await cashTx.create({ accountId, amount, type, note, createdBy });
  },
};
