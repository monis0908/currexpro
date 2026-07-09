import { createFirestoreService } from "./firestoreService";

const base = createFirestoreService("activityLogs");

export const activityLogService = {
  ...base,
  async record({ userId, userName, action, details = "" }) {
    return base.create({ userId, userName, action, details });
  },
  async getRecent(count = 50) {
    return base.getAll([base.orderBy("createdAt", "desc"), base.limit(count)]);
  },
};
