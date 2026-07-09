import { createCollectionService } from "./collectionService.js";

const service = createCollectionService("activityLogs");

export const activityLogService = {
  ...service,
  async record({ userId, userName, action, details = "" }) {
    return service.create({ userId, userName, action, details });
  },
  async getRecent(count = 100) {
    return service.getAll({ orderBy: { field: "createdAt", direction: "desc" }, limit: count });
  },
};
