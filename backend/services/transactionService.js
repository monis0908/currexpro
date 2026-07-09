import { createCollectionService } from "./collectionService.js";
import { bankService } from "./bankService.js";
import { activityLogService } from "./activityLogService.js";

const service = createCollectionService("transactions");

export const transactionService = {
  ...service,

  async recordDeal(payload, actor) {
    const total = Number(payload.amount) * Number(payload.rate);

    const id = await service.create({
      ...payload,
      total,
      status: "completed",
      createdBy: actor?.uid || "system",
      createdByName: actor?.name || actor?.email || "System",
    });

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
      userName: actor?.name || actor?.email || "System",
      action: payload.type === "buy" ? "Currency Buy" : "Currency Sell",
      details: `${payload.amount} ${payload.currencyCode} @ ${payload.rate} = ${total.toFixed(2)}`,
    });

    return id;
  },
};
