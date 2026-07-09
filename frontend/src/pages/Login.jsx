import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { authService } from "../services/authService";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Jab bhi Login page dikhe (normal navigate ya back button se),
  // koi bhi purana/stale Firebase session turant clear kar do.
  // Isse Forward button dabane par dobara authenticated area open nahi hoga.
useEffect(() => {
  // Turant, synchronous session clear — Firebase ke network response
  // ka wait nahi karta, isliye agar user turant aur peeche/aage jaye
  // (jaise Chrome ke New Tab page tak), tab bhi session guaranteed clear rehta hai.
  sessionStorage.clear();
  authService.logout(); // background mein Firebase ko bhi properly sign-out batao
}, []);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await login(values.identifier, values.password);
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error("Invalid username/email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-ink flex items-center justify-center mb-4 shadow-card">
            <FiTrendingUp size={24} className="text-mint" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">CurrExPro</h1>
          <p className="text-sm text-muted mt-1">Currency exchange management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-black/[0.04] p-7">
          <h2 className="font-display font-semibold text-lg text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-muted mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Username / Email"
              type="text"
              placeholder="ali.raza or you@business.com"
              error={errors.identifier?.message}
              {...register("identifier", { required: "Username or email is required" })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password", { required: "Password is required" })}
            />

            <Button type="submit" loading={loading} className="mt-2 w-full" size="lg">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted text-center mt-6">
          Access is provisioned by your administrator. Contact them if you need an account.
        </p>
      </div>
    </div>
  );
}