import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
      <input
        ref={ref}
        className={`w-full rounded-xl border ${
          error ? "border-coral" : "border-black/10"
        } bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-coral mt-1 block">{error}</span>}
    </label>
  );
});
Input.displayName = "Input";
export default Input;
