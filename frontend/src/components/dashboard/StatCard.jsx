import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import Card from "../common/Card";

const TONES = {
  mint: { bg: "bg-mint-light", text: "text-mint" },
  coral: { bg: "bg-coral-light", text: "text-coral" },
  accent: { bg: "bg-accent-light", text: "text-accent" },
  amber: { bg: "bg-amber-light", text: "text-amber" },
};

export default function StatCard({ label, value, icon: Icon, tone = "accent", trend, sub }) {
  const t = TONES[tone];
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center`}>
          <Icon size={18} className={t.text} />
        </div>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trend >= 0 ? "text-mint" : "text-coral"
            }`}
          >
            {trend >= 0 ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="font-display font-tabular text-2xl font-bold text-ink mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </div>
    </Card>
  );
}
