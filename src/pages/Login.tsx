import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length <= 4) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* Left Panel — Abstract Art */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden gradient-primary">
        <div className="absolute top-6 left-8 z-10">
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Finova</h1>
        </div>

        {/* Abstract shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[20%] right-[15%] w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-[40%] left-[40%] w-48 h-48 rounded-full border border-white/20" />
          <div className="absolute top-[30%] left-[35%] w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute bottom-[30%] left-[20%] w-32 h-32 rounded-2xl rotate-45 bg-white/5 backdrop-blur-sm" />
          <div className="absolute top-[55%] right-[25%] w-24 h-24 rounded-2xl rotate-12 border border-white/15" />
        </div>

        {/* Tagline */}
        <div className="absolute bottom-12 left-8 right-8 z-10">
          <p className="text-white/90 text-3xl font-display font-semibold leading-tight max-w-md">
            Your finances,<br />
            elevated.
          </p>
          <p className="text-white/50 mt-3 text-base max-w-sm">
            Smart analytics and beautiful insights for modern financial management.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex justify-between items-center p-6">
          <span className="lg:hidden text-xl font-display font-bold gradient-text">Finova</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground mt-1.5 text-sm">Sign in to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <label
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    focusedField === "email" || email
                      ? "-top-2.5 text-xs bg-background px-1 text-primary font-medium"
                      : "top-3 text-sm text-muted-foreground"
                  }`}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-12 px-3 rounded-lg border bg-background text-foreground text-sm
                    transition-all duration-200 outline-none
                    ${errors.email ? "border-destructive ring-2 ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <label
                  className={`absolute left-3 transition-all duration-200 pointer-events-none z-10 ${
                    focusedField === "password" || password
                      ? "-top-2.5 text-xs bg-background px-1 text-primary font-medium"
                      : "top-3 text-sm text-muted-foreground"
                  }`}
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-12 px-3 pr-10 rounded-lg border bg-background text-foreground text-sm
                    transition-all duration-200 outline-none
                    ${errors.password ? "border-destructive ring-2 ring-destructive/20" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 gradient-primary text-white rounded-lg font-medium text-sm
                  flex items-center justify-center gap-2
                  hover:opacity-90 active:scale-[0.98] transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed shadow-premium"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 p-4 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="text-foreground font-medium">Admin:</span> admin@zorvyn.com / admin</p>
                <p><span className="text-foreground font-medium">Analyst:</span> analyst@zorvyn.com / analyst123</p>
                <p><span className="text-foreground font-medium">Viewer:</span> viewer@zorvyn.com / viewer123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
