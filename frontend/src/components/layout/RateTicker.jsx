import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { useCollection } from "../../hooks/useCollection";
import { currencyService } from "../../services/currencyService";

export default function RateTicker() {
  const { data: rates } = useCollection(currencyService, [], []);
  const active = rates.filter((r) => r.active !== false);

  if (active.length === 0) return null;

  const items = [...active, ...active]; // duplicate for seamless loop

  return (
    <div className="w-full bg-ink-muted overflow-hidden border-b border-white/5">
      <div className="flex w-max animate-ticker py-2">
        {items.map((r, i) => (
          <div
            key={`${r.id}-${i}`}
            className="flex items-center gap-2 px-5 text-xs whitespace-nowrap border-r border-white/5"
          >
            <span className="font-semibold text-white/90 font-tabular">{r.code}</span>
            <span className="text-white/50">Buy {Number(r.buyRate ?? 0).toFixed(2)}</span>
            <span className="text-white/50">Sell {Number(r.sellRate ?? 0).toFixed(2)}</span>
            {r.trend === "down" ? (
              <FiArrowDown size={12} className="text-coral" />
            ) : (
              <FiArrowUp size={12} className="text-mint" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
