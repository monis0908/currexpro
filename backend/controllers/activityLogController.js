import { activityLogService } from "../services/activityLogService.js";

export async function listLogs(req, res) {
  const data = await activityLogService.getRecent(200);
  res.json({ success: true, data });
}
