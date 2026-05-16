import authService from "@/services/authService"
import TokenStore from "@/services/tokenStore"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const result = await authService.signin({
        email: form.email,
        password: form.password
      })

      TokenStore.set(result);

      const to = location.state?.from || "/dashboard";

      navigate(to, { replace: true })
    } catch (err: any) {
      console.error(err?.response?.data);
      toast.error("Login failed");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* logo / wordmark */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-[#0a0a0a]" />
            </div>
            <span className="text-white text-sm font-medium tracking-wide">Pollx</span>
          </div>
          <h1 className="text-white text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-[#555] text-sm mt-1.5">Sign in to your account</p>
        </div>

        {/* card */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[#888] text-xs font-medium uppercase tracking-widest">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#333] outline-none focus:border-[#333] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#888] text-xs font-medium uppercase tracking-widest">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#333] outline-none focus:border-[#333] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-white text-[#0a0a0a] rounded-xl py-3 text-sm font-semibold tracking-tight hover:bg-[#e5e5e5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1f1f1f]" />
            <span className="text-[#444] text-xs">or</span>
            <div className="flex-1 h-px bg-[#1f1f1f]" />
          </div>

          {/* google oauth placeholder */}
          <button
            type="button"
            disabled
            className="w-full border border-[#1f1f1f] rounded-xl py-3 text-sm text-[#444] flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-[#444] text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-white hover:text-[#ccc] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}