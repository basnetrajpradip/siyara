import { useState } from "react"
import { useNavigate } from "react-router"
import { Mail, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import ayurLogo from "/logo.png"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/validation/authValidation"
import { forgotPassword } from "@/services/authService"
import { Spinner } from "@/components/ui/spinner"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
    defaultValues: { email: "" },
  })

  const onSubmit = async (payload: ForgotPasswordFormData) => {
    try {
      const res = await forgotPassword(payload.email)
      if (res.success) {
        setSubmittedEmail(payload.email)
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Something went wrong"
      toast.error(message)
    }
  }

  if (submittedEmail) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary-600 via-[#168183] to-primary-800 p-4">
        <div className="pointer-events-none absolute left-10 top-20 size-32 rounded-full bg-primary-400 opacity-20 blur-[128px]" />
        <div className="pointer-events-none absolute bottom-40 right-32 size-40 rounded-full bg-primary-300 opacity-20 blur-[128px]" />

        <div className="relative w-full max-w-[448px] rounded-2xl bg-white px-10 py-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] text-center">
          <div className="flex justify-center">
            <img src={ayurLogo} alt="Ayur Darpan" className="h-16 w-[235px]" />
          </div>

          <div className="pt-8">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary-100">
              <Mail className="size-6 text-primary-600" />
            </div>
            <h1 className="font-libre text-2xl font-bold text-primary-900">Check Your Email</h1>
            <p className="pt-2 font-syne text-base text-primary-700/90">
              We've sent a 6-digit OTP to <strong>{submittedEmail}</strong>. Enter it on the next screen to reset your
              password.
            </p>
          </div>

          <Button
            onClick={() => {
              sessionStorage.setItem("admin_forgot_password_email", submittedEmail)
              navigate(`/verify-otp?email=${encodeURIComponent(submittedEmail)}`)
            }}
            className="mt-6 w-full rounded-xl bg-secondary-600 py-5 text-base font-semibold text-white hover:bg-secondary-500 active:scale-[0.98]"
          >
            Enter OTP
          </Button>

          <button
            type="button"
            onClick={() => setSubmittedEmail(null)}
            className="mt-4 w-full font-syne text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            Try a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary-600 via-[#168183] to-primary-800 p-4">
      <div className="pointer-events-none absolute left-10 top-20 size-32 rounded-full bg-primary-400 opacity-20 blur-[128px]" />
      <div className="pointer-events-none absolute bottom-40 right-32 size-40 rounded-full bg-primary-300 opacity-20 blur-[128px]" />
      <div className="pointer-events-none absolute left-1/4 top-1/2 size-24 rounded-full bg-primary-500 opacity-10 blur-[80px]" />

      <div className="relative w-full max-w-[448px] rounded-2xl bg-white px-10 py-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex justify-center">
          <img src={ayurLogo} alt="Ayur Darpan" className="h-16 w-[235px]" />
        </div>

        <div className="pt-8 text-center">
          <h1 className="font-libre text-3xl font-bold text-primary-900">Forgot Password</h1>
          <p className="pt-2 font-syne text-base text-primary-700/90">
            Enter your email and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form className="pt-8" onSubmit={handleSubmit(onSubmit)}>
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded-xl bg-secondary-600 py-5 text-base font-semibold text-white hover:bg-secondary-500 active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? "Sending OTP" : "Send OTP"}
            {isSubmitting && <Spinner data-icon="inline-end" />}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-1.5 font-syne text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
