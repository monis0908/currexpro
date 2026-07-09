import { transactionService } from "../services/transactionService.js";

export async function listTransactions(req, res) {
  const { type } = req.query;
  const options = { orderBy: { field: "createdAt", direction: "desc" } };
  if (type) options.where = [["type", "==", type]];
  const data = await transactionService.getAll(options);
  res.json({ success: true, data });
}

export async function createTransaction(req, res) {
  const actor = { uid: req.user.uid, email: req.user.email, name: req.body.actorName };
  const id = await transactionService.recordDeal(req.body, actor);
  res.status(201).json({ success: true, data: { id } });
}

export async function updateTransaction(req, res) {
  const { amount, rate, notes } = req.body;
  const patch = { notes };
  if (amount !== undefined && rate !== undefined) {
    patch.amount = Number(amount);
    patch.rate = Number(rate);
    patch.total = Number(amount) * Number(rate);
  }
  await transactionService.update(req.params.id, patch);
  res.json({ success: true, data: { id: req.params.id } });
}

export async function deleteTransaction(req, res) {
  await transactionService.remove(req.params.id);
  res.json({ success: true, data: { id: req.params.id } });
}
