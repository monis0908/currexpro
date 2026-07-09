import { createCollectionService } from "../services/collectionService.js";

const service = createCollectionService("customers");

export async function listCustomers(req, res) {
  const customers = await service.getAll({ orderBy: { field: "name" } });
  res.json({ success: true, data: customers });
}

export async function getCustomer(req, res) {
  const customer = await service.getById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });
  res.json({ success: true, data: customer });
}

export async function createCustomer(req, res) {
  const id = await service.create(req.body);
  res.status(201).json({ success: true, data: { id } });
}

export async function updateCustomer(req, res) {
  await service.update(req.params.id, req.body);
  res.json({ success: true, data: { id: req.params.id } });
}

export async function deleteCustomer(req, res) {
  await service.remove(req.params.id);
  res.json({ success: true, data: { id: req.params.id } });
}
