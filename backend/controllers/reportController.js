import { createCollectionService } from "../services/collectionService.js";

const transactions = createCollectionService("transactions");

export async function getSummary(req, res) {
  const { range = "weekly" } = req.query;
  const days = { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[range] || 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const all = await transactions.getAll({ orderBy: { field: "createdAt", direction: "desc" } });
  const filtered = all.filter((t) => t.createdAt?.toDate && t.createdAt.toDate() >= cutoff);

  const buy = filtered.filter((t) => t.type === "buy").reduce((s, t) => s + (t.total || 0), 0);
  const sell = filtered.filter((t) => t.type === "sell").reduce((s, t) => s + (t.total || 0), 0);

  res.json({
    success: true,
    data: {
      range,
      count: filtered.length,
      buy,
      sell,
      profit: sell - buy,
      transactions: filtered,
    },
  });
}
