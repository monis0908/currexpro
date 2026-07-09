import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { settingsService } from "../services/settingsService";
import { useToast } from "../hooks/useToast";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

export default function SettingsLanguage() {
  const [current, setCurrent] = useState("en");
  const toast = useToast();

  useEffect(() => {
    settingsService.get().then((s) => setCurrent(s.language || "en"));
  }, []);

  const save = async (code) => {
    setCurrent(code);
    await settingsService.update({ language: code });
    toast.success("Language preference saved.");
  };

  return (
    <div>
      <PageHeader title="Language" description="Choose the display language for this system." />
      <Card className="max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => save(l.code)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                current === l.code ? "border-accent bg-accent-light text-accent" : "border-black/10 hover:bg-paper text-ink"
              }`}
            >
              {l.label}
              {current === l.code && <span className="text-xs">Active</span>}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-4">
          Note: this stores the preference; wiring translated strings across the UI is a follow-up step (see i18n note in the README).
        </p>
      </Card>
    </div>
  );
}
