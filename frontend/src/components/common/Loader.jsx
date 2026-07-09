export default function Loader({ label = "Loading...", full = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-muted ${
        full ? "h-[60vh]" : "py-10"
      }`}
    >
      <div className="w-8 h-8 border-[3px] border-ink/10 border-t-ink rounded-full animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
