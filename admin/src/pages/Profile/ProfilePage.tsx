import { useRef, useState } from "react"
import type React from "react"
import { useNavigate } from "react-router"
import { Key, Mail, Phone, Pencil, Shield, X, Check, User, Users, CalendarDays, MapPin } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { handleError } from "@/lib/error-utils"
import { ListHeader } from "@/components/ui/list-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { FormField } from "@/components/common/FormComponents"
import { toast } from "sonner"
import { getInitials } from "@/lib/utils"
import { updateAvatar, updateProfile } from "@/services/userService"
import { uploadMedia } from "@/services/mediaService"
import { useForm } from "react-hook-form"
import { profileSchema, type ProfileFormData } from "@/validation/userValidation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import env from "@/config/env-config"

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: user?.phone || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      address: user?.address || "",
    },
  })

  if (!isHydrated || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  const cancelEditing = () => {
    setIsEditing(false)
    reset()
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const res = await updateProfile({
        email: data.email.trim() || undefined,
        phone: data.phone?.trim() || null,
        firstName: data.firstName?.trim() || undefined,
        lastName: data.lastName?.trim() || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address?.trim() || undefined,
      })
      if (res.success) {
        updateUser(res.data)
        toast.success("Profile updated successfully")
      } else {
        toast.error(res.message)
      }
    } catch (err) {
      handleError(err)
    } finally {
      setIsEditing(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const media = await uploadMedia(file, `${user.firstName} ${user.lastName} avatar`)
      const res = await updateAvatar({ mediaId: media.id })
      updateUser(res.data)
      toast.success("Avatar updated successfully")
    } catch (err) {
      handleError(err)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <div className="px-4 pb-4 pt-6 md:px-8 md:pb-6 md:pt-8">
      <ListHeader title="Profile" subtitle="Manage your profile and account settings" />

      <div className="flex flex-col gap-6 pt-4 lg:pt-8">
        {/* User info card */}
        <div className="w-full">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex justify-between md:flex-row flex-col gap-4 ">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar className="size-[80px] border-none">
                    <AvatarImage className="rounded-[4px]" src={`${env.BACKEND_BASE_URL}${user?.avatar}`} />
                    <AvatarFallback className="uppercase">{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-secondary-600 text-white shadow-md hover:bg-secondary-700 transition-colors disabled:opacity-60"
                    >
                      {isUploadingAvatar ? (
                        <Spinner className="size-3.5" />
                      ) : (
                        <Pencil className="size-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                {/* Name & role */}
                <div className="min-w-0 flex-1">
                  <h2 className="font-libre text-2xl font-bold text-[#033333]">{user.firstName} {user.lastName}</h2>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Shield className="size-4 text-secondary-600" />
                    <span className="font-syne text-sm font-semibold text-secondary-700">
                      {user.role === "ADMIN" ? "Administrator" : user.role}
                    </span>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="h-10 gap-2 rounded-xl bg-secondary-600 px-5 text-sm font-semibold text-white hover:bg-secondary-700 disabled:opacity-60"
                >
                  <Pencil className="size-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Details */}
            {!isEditing ? (
              <div className="mt-6 space-y-4 border-t border-border pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
                      <Mail className="size-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-syne text-xs font-medium text-[#066666]">Email Address</p>
                      <p className="font-syne text-sm font-semibold text-[#033333]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
                      <Phone className="size-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-syne text-xs font-medium text-[#066666]">Phone Number</p>
                      <p className="font-syne text-sm font-semibold text-[#033333]">{user.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
                      <User className="size-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-syne text-xs font-medium text-[#066666]">First Name</p>
                      <p className="font-syne text-sm font-semibold text-[#033333]">{user.firstName || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
                      <Users className="size-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-syne text-xs font-medium text-[#066666]">Last Name</p>
                      <p className="font-syne text-sm font-semibold text-[#033333]">{user.lastName || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
                      <CalendarDays className="size-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-syne text-xs font-medium text-[#066666]">Date of Birth</p>
                      <p className="font-syne text-sm font-semibold text-[#033333]">
                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-IN") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
                      <MapPin className="size-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-syne text-xs font-medium text-[#066666]">Address</p>
                      <p className="font-syne text-sm font-semibold text-[#033333]">{user.address || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 border-t border-border pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField label="Email" error={errors.email?.message} required>
                    <Input {...register("email")} placeholder="Your email" aria-invalid={!!errors.email} />
                  </FormField>

                  <FormField label="Phone" error={errors.phone?.message}>
                    <Input {...register("phone")} placeholder="Your phone number" />
                  </FormField>

                  <FormField label="First Name" error={errors.firstName?.message}>
                    <Input {...register("firstName")} placeholder="First name" />
                  </FormField>

                  <FormField label="Last Name" error={errors.lastName?.message}>
                    <Input {...register("lastName")} placeholder="Last name" />
                  </FormField>

                  <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
                    <Input type="date" {...register("dateOfBirth")} />
                  </FormField>

                  <FormField label="Address" error={errors.address?.message} className="lg:col-span-2">
                    <Input {...register("address")} placeholder="Your address" />
                  </FormField>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 gap-2 rounded-xl bg-secondary-600 px-5 text-sm font-semibold text-white hover:bg-secondary-700 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="size-4" />
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Check className="size-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                    disabled={isSubmitting}
                    className="h-10 gap-2 px-5 text-sm font-semibold"
                  >
                    <X className="size-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="mt-6 rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50">
                  <Key className="size-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-libre text-lg font-bold text-[#033333]">Password</h3>
                  <p className="font-syne text-sm text-[#066666]">Update your account password</p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/profile/change-password")}
                className="h-11 gap-2 rounded-xl bg-secondary-600 px-5 text-sm font-semibold text-white hover:bg-secondary-700"
              >
                <Key className="size-4" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
