import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const SETTINGS_DOC = "settings/general";

export const settingsService = {
  async get() {
    const ref = doc(db, SETTINGS_DOC);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const defaults = {
        businessName: "CurrExPro",
        language: "en",
        baseCurrency: "USD",
        theme: "light",
      };
      await setDoc(ref, defaults);
      return defaults;
    }
    return snap.data();
  },
  async update(data) {
    const ref = doc(db, SETTINGS_DOC);
    await setDoc(ref, data, { merge: true });
  },
};
