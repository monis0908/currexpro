import { backupService } from "../services/backupService.js";

export const backupController = {
  async exportAll(req, res) {
    const data = await backupService.exportAll();
    res.status(200).json({ success: true, data });
  },
};
