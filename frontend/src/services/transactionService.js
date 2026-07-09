import { createFirestoreService } from "./firestoreService";
import { bankService } from "./bankService";
import { activityLogService } from "./activityLogService";

const base = createFirestoreService("transactions");

export const transactionService = {
  ...base,

  /**
   * Records a currency buy or sell.
   * payload: {
   *   type: 'buy' | 'sell',
   *   customerId, customerName,
   *   currencyCode, currencyName,
   *   amount, rate, total,
   *   paymentMethod: 'cash' | 'transfer',
   *   accountId, notes,
   * }
   */
  async recordDeal(payload, actor) {
    const total = Number(payload.amount) * Number(payload.rate);

    const id = await base.create({
      ...payload,
      total,
      status: "completed",
      createdBy: actor?.uid || "system",
      createdByName: actor?.name || "System",
    });

    // Buying currency from a customer pays cash out; selling currency to a
    // customer takes cash in. Bank/cash balances move opposite to the deal type.
    if (payload.accountId) {
      const movementType = payload.type === "buy" ? "withdraw" : "deposit";
      await bankService.adjustBalance(
        payload.accountId,
        total,
        movementType,
        `${payload.type === "buy" ? "Buy" : "Sell"} ${payload.amount} ${payload.currencyCode}`,
        actor?.uid || "system"
      );
    }

    await activityLogService.record({
      userId: actor?.uid || "system",
      userName: actor?.name || "System",
      action: payload.type === "buy" ? "Currency Buy" : "Currency Sell",
      details: `${payload.amount} ${payload.currencyCode} @ ${payload.rate} = ${total.toFixed(2)}`,
    });

    return id;
  },

  async getByDateRange(startDate, endDate) {
    return base.getAll([
      base.where("createdAt", ">=", startDate),
      base.where("createdAt", "<=", endDate),
      base.orderBy("createdAt", "desc"),
    ]);
  },

  async getRecent(count = 10) {
    return base.getAll([base.orderBy("createdAt", "desc"), base.limit(count)]);
  },
};
