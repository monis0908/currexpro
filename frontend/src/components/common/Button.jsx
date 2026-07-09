const VARIANTS = {
  primary: "bg-ink text-white hover:bg-ink-light",
  accent: "bg-accent text-white hover:bg-accent/90",
  mint: "bg-mint text-white hover:bg-mint/90",
  coral: "bg-coral text-white hover:bg-coral/90",
  ghost: "bg-transparent text-ink hover:bg-black/5",
  outline: "bg-transparent border border-black/10 text-ink hover:bg-black/[0.03]",
  danger: "bg-coral-light text-coral hover:bg-coral hover:text-white",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-5 py-3",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  icon: Icon,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  );
}
