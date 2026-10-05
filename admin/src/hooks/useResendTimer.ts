import { useState, useEffect, useCallback } from "react"

const STORAGE_PREFIX = "otp_resend_"

function getStorageKey(email: string) {
  return `${STORAGE_PREFIX}${email}`
}

export default function useResendTimer(email: string, cooldownSeconds = 180) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!email) return cooldownSeconds
    const stored = localStorage.getItem(getStorageKey(email))
    if (!stored) return cooldownSeconds
    const elapsed = Math.floor((Date.now() - Number(stored)) / 1000)
    return Math.max(0, cooldownSeconds - elapsed)
  })

  const startTimer = useCallback(() => {
    if (!email) return
    localStorage.setItem(getStorageKey(email), String(Date.now()))
    setSecondsLeft(cooldownSeconds)
  }, [email, cooldownSeconds])

  useEffect(() => {
    if (!email) return
    const stored = localStorage.getItem(getStorageKey(email))
    if (!stored) {
      localStorage.setItem(getStorageKey(email), String(Date.now()))
    }
  }, [email])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  return { secondsLeft, canResend: secondsLeft === 0, startTimer }
}
