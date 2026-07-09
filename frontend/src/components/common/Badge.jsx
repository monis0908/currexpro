const STYLES = {
  mint: "bg-mint-light text-mint",
  coral: "bg-coral-light text-coral",
  amber: "bg-amber-light text-amber",
  accent: "bg-accent-light text-accent",
  slate: "bg-black/5 text-muted",
};

export default function Badge({ children, color = "slate", className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[color]} ${className}`}
    >
      {children}
    </span>
  );
}
