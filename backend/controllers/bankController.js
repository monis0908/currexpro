import { bankService } from "../services/bankService.js";

export async function listAccounts(req, res) {
  const { type } = req.query;
  const data = type ? await bankService.listByType(type) : await bankService.getAll({ orderBy: { field: "name" } });
  res.json({ success: true, data });
}

export async function createAccount(req, res) {
  const { name, type, opening } = req.body;
  const id = await bankService.create({ name, type, balance: Number(opening) || 0 });
  res.status(201).json({ success: true, data: { id } });
}

export async function getHistory(req, res) {
  const data = await bankService.getHistory(req.params.id);
  res.json({ success: true, data });
}

export async function adjustBalance(req, res) {
  const { amount, type, note } = req.body;
  await bankService.adjustBalance(req.params.id, Number(amount), type, note, req.user.uid);
  res.json({ success: true, data: { id: req.params.id } });
}
