import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { Shield, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import ayurLogo from "/logo.png"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import useResendTimer from "@/hooks/useResendTimer"
import { verifyOtp, forgotPassword } from "@/services/authService"

const EMAIL_SESSION_KEY = "admin_forgot_password_email"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function resolveEmail(queryEmail: string): string {
  if (queryEmail && EMAIL_REGEX.test(queryEmail)) return queryEmail
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(EMAIL_SESSION_KEY)
    if (stored && EMAIL_REGEX.test(stored)) return stored
  }
  return ""
}

export default function VerifyOtp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryEmail = searchParams.get("email") || ""

  const email = useMemo(() => resolveEmail(queryEmail), [queryEmail])
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const { secondsLeft, canResend, startTimer } = useResendTimer(email)

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true })
      return
    }
    if (queryEmail && EMAIL_REGEX.test(queryEmail)) {
      sessionStorage.setItem(EMAIL_SESSION_KEY, queryEmail)
    }
  }, [email, queryEmail, navigate])

  const handleResend = useCallback(async () => {
    if (!canResend || isResending) return
    setIsResending(true)
    try {
      await forgotPassword(email)
      startTimer()
      toast.success("Verification code resent to your email")
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to resend code"
      toast.error(message)
    } finally {
      setIsResending(false)
    }
  }, [email, canResend, isResending, startTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newDigits = [...digits]
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)

    const nextEmpty = newDigits.findIndex((d) => !d)
    if (nextEmpty >= 0 && nextEmpty < 6) {
      inputRefs.current[nextEmpty]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async () => {
    const otp = digits.join("")
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await verifyOtp(email, otp)
      if (res.success) {
        sessionStorage.removeItem(EMAIL_SESSION_KEY)
        toast.success("OTP verified successfully")
        navigate(`/reset-password?token=${encodeURIComponent(res.data.resetToken)}`, { replace: true })
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Invalid OTP"
      toast.error(message)
      setDigits(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!email) return null

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
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary-100">
            <Shield className="size-6 text-primary-600" />
          </div>
          <h1 className="font-libre text-2xl font-bold text-primary-900">Verify OTP</h1>
          <p className="pt-2 font-syne text-base text-primary-700/90">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
        </div>

        <div className="pt-8">
          <Label className="mb-4 block text-center font-syne text-sm font-medium text-primary-700">
            One-Time Password
          </Label>

          <div className="flex justify-center gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="size-9 rounded-lg border-2 border-primary-200 text-center font-syne text-lg font-bold text-primary-900 outline-none transition-colors focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200 sm:size-12 sm:text-xl"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || digits.join("").length !== 6}
          className="mt-6 w-full rounded-xl bg-secondary-600 py-5 text-base font-semibold text-white hover:bg-secondary-500 active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="mt-6 space-y-3 text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-syne text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          ) : (
            <span className="font-syne text-sm text-primary-700/70">
              Resend code in <strong>{secondsLeft}s</strong>
            </span>
          )}

          <div>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="inline-flex items-center gap-1.5 font-syne text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              <ArrowLeft className="size-4" />
              Use a different email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
