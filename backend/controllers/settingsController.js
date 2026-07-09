import { db } from "../firebase/admin.js";

const DOC_PATH = ["settings", "general"];

export async function getSettings(req, res) {
  const ref = db.collection(DOC_PATH[0]).doc(DOC_PATH[1]);
  const snap = await ref.get();
  if (!snap.exists) {
    const defaults = { businessName: "CurrExPro", language: "en", baseCurrency: "USD", theme: "light" };
    await ref.set(defaults);
    return res.json({ success: true, data: defaults });
  }
  res.json({ success: true, data: snap.data() });
}

export async function updateSettings(req, res) {
  const ref = db.collection(DOC_PATH[0]).doc(DOC_PATH[1]);
  await ref.set(req.body, { merge: true });
  res.json({ success: true, data: req.body });
}
