import { useState } from "react";
import { FiDownloadCloud, FiDatabase } from "react-icons/fi";
import { collection, getDocs } from "firebase/firestore";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useToast } from "../hooks/useToast";
import { db } from "../firebase/firebase";

// Collections included in the full data export.
const COLLECTIONS_TO_EXPORT = [
  "customers",
  "transactions",
  "currencyRates",
  "bankAccounts",
];

const fetchCollection = async (name) => {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export default function SettingsBackup() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const runBackup = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        COLLECTIONS_TO_EXPORT.map((name) => fetchCollection(name))
      );

      const data = COLLECTIONS_TO_EXPORT.reduce((acc, name, i) => {
        acc[name] = results[i];
        return acc;
      }, {});

      data.exportedAt = new Date().toISOString();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `currexpro-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded successfully.");
    } catch (err) {
      toast.error(err.message || "Backup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Backup" description="Export a full snapshot of your business data." />
      <Card className="max-w-xl">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
            <FiDatabase size={20} className="text-accent" />
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-display font-semibold text-ink mb-1">Full data export</h3>
            <p className="text-sm text-muted mb-4">
              Downloads a JSON file containing customers, transactions, currency rates and bank
              accounts — useful for offline records or migrating to a new environment.
            </p>
            <Button icon={FiDownloadCloud} loading={loading} onClick={runBackup} className="w-full sm:w-auto">
              Export Backup Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}