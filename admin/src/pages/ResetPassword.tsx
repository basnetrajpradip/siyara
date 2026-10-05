import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import ayurLogo from "/logo.png"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/validation/authValidation"
import { resetPassword } from "@/services/authService"
import { Spinner } from "@/components/ui/spinner"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  if (!token) {
    navigate("/forgot-password", { replace: true })
    return null
  }

  const onSubmit = async (payload: ResetPasswordFormData) => {
    try {
      const res = await resetPassword(token, payload.newPassword)
      if (res.success) {
        setIsSuccess(true)
        toast.success("Password reset successfully")
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Something went wrong"
      toast.error(message)
    }
  }

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary-600 via-[#168183] to-primary-800 p-4">
        <div className="pointer-events-none absolute left-10 top-20 size-32 rounded-full bg-primary-400 opacity-20 blur-[128px]" />
        <div className="pointer-events-none absolute bottom-40 right-32 size-40 rounded-full bg-primary-300 opacity-20 blur-[128px]" />

        <div className="relative w-full max-w-[448px] rounded-2xl bg-white px-10 py-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] text-center">
          <div className="flex justify-center">
            <img src={ayurLogo} alt="Ayur Darpan" className="h-16 w-[235px]" />
          </div>

          <div className="pt-8">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-6 text-green-600" />
            </div>
            <h1 className="font-libre text-2xl font-bold text-primary-900">Password Reset Complete</h1>
            <p className="pt-2 font-syne text-base text-primary-700/90">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
          </div>

          <Button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-6 w-full rounded-xl bg-secondary-600 py-5 text-base font-semibold text-white hover:bg-secondary-500 active:scale-[0.98]"
          >
            Sign In
          </Button>
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
          <h1 className="font-libre text-3xl font-bold text-primary-900">Reset Password</h1>
          <p className="pt-2 font-syne text-base text-primary-700/90">Enter your new password below.</p>
        </div>

        <form className="pt-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Lock className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                aria-invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
              <InputGroupAddon align="inline-end">
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </InputGroupAddon>
            </InputGroup>
            {errors.newPassword && <p className="text-xs text-error-600 font-syne">{errors.newPassword.message}</p>}
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Lock className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <InputGroupAddon align="inline-end">
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </InputGroupAddon>
            </InputGroup>
            {errors.confirmPassword && (
              <p className="text-xs text-error-600 font-syne">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded-xl bg-secondary-600 py-5 text-base font-semibold text-white hover:bg-secondary-500 active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? "Resetting Password" : "Reset Password"}
            {isSubmitting && <Spinner data-icon="inline-end" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
