export default function Card({ children, className = "", padded = true, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft border border-black/[0.04] ${
        padded ? "p-5" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
