import { useState } from "react";
import { FiDownloadCloud, FiDatabase } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useToast } from "../hooks/useToast";
import apiClient from "../services/apiClient";

export default function SettingsBackup() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const runBackup = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/backup/export");
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `currexpro-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded successfully.");
    } catch {
      toast.error("Backup failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Backup" description="Export a full snapshot of your business data." />
      <Card className="max-w-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
            <FiDatabase size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-ink mb-1">Full data export</h3>
            <p className="text-sm text-muted mb-4">
              Downloads a JSON file containing customers, transactions, currency rates, bank accounts
              and settings — useful for offline records or migrating to a new environment.
            </p>
            <Button icon={FiDownloadCloud} loading={loading} onClick={runBackup}>
              Export Backup Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
