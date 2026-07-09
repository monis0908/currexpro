import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-light flex items-center justify-center mb-5">
        <FiAlertTriangle size={28} className="text-amber" />
      </div>
      <h1 className="font-display text-3xl font-bold text-ink mb-2">Page not found</h1>
      <p className="text-sm text-muted mb-6 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
