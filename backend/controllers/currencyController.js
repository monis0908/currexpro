import { createCollectionService } from "../services/collectionService.js";

const service = createCollectionService("currencyRates");

export async function listRates(req, res) {
  const rates = await service.getAll({ orderBy: { field: "code" } });
  res.json({ success: true, data: rates });
}

export async function createRate(req, res) {
  const payload = { ...req.body, code: req.body.code.toUpperCase(), active: req.body.active ?? true };
  const id = await service.create(payload);
  res.status(201).json({ success: true, data: { id } });
}

export async function updateRate(req, res) {
  await service.update(req.params.id, req.body);
  res.json({ success: true, data: { id: req.params.id } });
}

export async function deleteRate(req, res) {
  await service.remove(req.params.id);
  res.json({ success: true, data: { id: req.params.id } });
}
