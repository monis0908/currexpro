import { createFirestoreService } from "./firestoreService";

const base = createFirestoreService("currencyRates");

export const currencyService = {
  ...base,
  async getActive() {
    return base.getAll([base.where("active", "==", true), base.orderBy("code")]);
  },
};
