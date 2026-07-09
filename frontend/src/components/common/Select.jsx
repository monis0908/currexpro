import { forwardRef } from "react";

const Select = forwardRef(({ label, error, options = [], placeholder, className = "", ...props }, ref) => {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
      <select
        ref={ref}
        className={`w-full rounded-xl border ${
          error ? "border-coral" : "border-black/10"
        } bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-coral mt-1 block">{error}</span>}
    </label>
  );
});
Select.displayName = "Select";
export default Select;
