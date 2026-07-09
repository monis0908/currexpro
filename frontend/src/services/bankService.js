import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { createFirestoreService } from "./firestoreService";

const accountsBase = createFirestoreService("bankAccounts");
const cashTxBase = createFirestoreService("cashTransactions");

export const bankService = {
  ...accountsBase,

  async getHistory(accountId) {
    return cashTxBase.getAll([
      cashTxBase.where("accountId", "==", accountId),
      cashTxBase.orderBy("createdAt", "desc"),
    ]);
  },

  /**
   * Adjusts an account balance atomically and records the movement,
   * so balances can never drift out of sync with their history.
   */
  async adjustBalance(accountId, amount, type, note = "", createdBy = "system") {
    const accountRef = doc(db, "bankAccounts", accountId);
    await runTransaction(db, async (t) => {
      const snap = await t.get(accountRef);
      if (!snap.exists()) throw new Error("Account not found");
      const current = snap.data().balance || 0;
      const nextBalance = type === "withdraw" ? current - amount : current + amount;
      t.update(accountRef, { balance: nextBalance, updatedAt: serverTimestamp() });
    });

    await cashTxBase.create({
      accountId,
      amount,
      type,
      note,
      createdBy,
    });
  },
};
