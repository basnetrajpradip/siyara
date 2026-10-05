import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import ayurLogo from "/logo.png"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginFormData } from "@/validation/authValidation"
import { useAuthStore } from "@/store/useAuthStore"
import { Spinner } from "@/components/ui/spinner"
export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (payload: LoginFormData) => {
    try {
      const res = await login(payload.email, payload.password)
      if (res.success) {
        navigate("/", { replace: true })
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Something went wrong"
      toast.error(message)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary-600 via-[#168183] to-primary-800 p-4">
      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute left-10 top-20 size-32 rounded-full bg-primary-400 opacity-20 blur-[128px]" />
      <div className="pointer-events-none absolute bottom-40 right-32 size-40 rounded-full bg-primary-300 opacity-20 blur-[128px]" />
      <div className="pointer-events-none absolute left-1/4 top-1/2 size-24 rounded-full bg-primary-500 opacity-10 blur-[80px]" />

      {/* Login card */}
      <div className="relative w-full max-w-[448px] rounded-2xl bg-white px-10 py-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={ayurLogo} alt="Ayur Darpan" className="h-16 w-[235px]" />
        </div>

        {/* Heading */}
        <div className="pt-8 text-center">
          <h1 className="font-libre text-3xl font-bold text-primary-900">Admin Portal</h1>
          <p className="pt-2 font-syne text-base text-primary-700/90">Sign in to manage your ayurvedic platform</p>
        </div>

        {/* Form */}
        <form className="pt-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Mail className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="Enter your email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </InputGroup>
            {errors.email && <p className="text-xs text-error-600 font-syne">{errors.email.message}</p>}
          </div>

          {/* Password field */}
          <div className="mt-5 space-y-2">
            <Label htmlFor="password">Password</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Lock className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <InputGroupAddon align="inline-end">
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </InputGroupAddon>
            </InputGroup>
            {errors.password && <p className="text-xs text-error-600 font-syne">{errors.password.message}</p>}
          </div>

          {/* Remember me & Forgot password */}
          <div className="mt-5 flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="font-syne text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded-xl bg-secondary-600 py-5 text-base font-semibold text-white hover:bg-secondary-500 active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? "Signing in" : "Sign In"}
            {isSubmitting && <Spinner data-icon="inline-end" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
