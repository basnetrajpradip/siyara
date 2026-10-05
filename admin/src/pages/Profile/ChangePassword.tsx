import { useState } from "react"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, EyeOff, Key, Lock } from "lucide-react"
import { changePasswordSchema, type ChangePasswordFormData } from "@/validation/authValidation"
import { changePassword } from "@/services/authService"
import { handleError } from "@/lib/error-utils"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { SectionCard, FormField } from "@/components/common/FormComponents"
import { ListHeader } from "@/components/ui/list-header"

export default function ChangePassword() {
  const navigate = useNavigate()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const res = await changePassword(data.currentPassword, data.newPassword)
      if (res.success) {
        toast.success("Password changed successfully")
        navigate("/profile")
      } else {
        toast.error(res.message)
      }
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div className="px-4 pb-4 pt-6 md:px-8 md:pb-6 md:pt-8">
      <ListHeader
        title="Change Password"
        subtitle="Update your account password. Once changed, you'll need to use the new password on your next login."
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6 lg:pt-8 pt-4">
          <div className="w-full lg:w-[70%]">
            <SectionCard title="Password Details">
              <div className="mt-4 flex flex-col gap-4">
                {/* Current Password */}
                <FormField label="Current Password" required error={errors.currentPassword?.message}>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Lock className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter your current password"
                      aria-invalid={!!errors.currentPassword}
                      {...register("currentPassword")}
                    />
                    <InputGroupAddon align="inline-end">
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} tabIndex={-1}>
                        {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </InputGroupAddon>
                  </InputGroup>
                </FormField>

                {/* New Password */}
                <FormField label="New Password" required error={errors.newPassword?.message}>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Key className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type={showNew ? "text" : "password"}
                      placeholder="Enter your new password"
                      aria-invalid={!!errors.newPassword}
                      {...register("newPassword")}
                    />
                    <InputGroupAddon align="inline-end">
                      <button type="button" onClick={() => setShowNew(!showNew)} tabIndex={-1}>
                        {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </InputGroupAddon>
                  </InputGroup>
                </FormField>

                {/* Confirm New Password */}
                <FormField label="Confirm New Password" required error={errors.confirmNewPassword?.message}>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Key className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      aria-invalid={!!errors.confirmNewPassword}
                      {...register("confirmNewPassword")}
                    />
                    <InputGroupAddon align="inline-end">
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                        {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </InputGroupAddon>
                  </InputGroup>
                </FormField>
              </div>
            </SectionCard>

            {/* Submit button */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 px-6 text-sm font-semibold"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 gap-2 rounded-xl bg-secondary-600 px-6 text-sm font-semibold text-white hover:bg-secondary-700 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    Changing...
                  </span>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
