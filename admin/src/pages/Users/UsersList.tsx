import { useState, useCallback, useEffect, useMemo } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ListHeader } from "@/components/ui/list-header"
import { DataTable, type Column } from "@/components/common/DataTable"
import { getUsers, deleteUser } from "@/services/userService"
import { useDebounce } from "@/hooks/useDebounce"
import type { User } from "@/types/user"
import { handleError } from "@/lib/error-utils"
import SearchFilter from "@/components/common/SearchFilter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import env from "@/config/env-config"
import { getInitials } from "@/lib/utils"

function RoleBadge({ role }: { role: "USER" | "ADMIN" }) {
  if (role === "ADMIN") {
    return <Badge variant="info">Admin</Badge>
  }
  return <Badge variant="success">Customer</Badge>
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const search = useDebounce(searchInput, 400)

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchInput("")
  }, [])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getUsers({
          limit: pageSize,
          search: search || undefined,
        })
        if (!cancelled) {
          setUsers(res.data.items)
          setTotal(res.data.pagination.total)
          setTotalPages(res.data.pagination.totalPages)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users")
          handleError(err)
          setUsers([])
          setTotal(0)
          setTotalPages(1)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [pageSize, refreshKey, search])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
  }, [])

  const pagination = useMemo(() => ({ page: 1, pageSize, total, totalPages }), [pageSize, total, totalPages])

  const handleDelete = useCallback((user: User) => {
    setUserToDelete(user)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return
    try {
      const res = await deleteUser(userToDelete.id)
      toast.success(res.message)
      refresh()
    } catch (error) {
      handleError(error)
    } finally {
      setUserToDelete(null)
    }
  }, [userToDelete, refresh])

  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: "avatar",
        label: "",
        render: (user) => (
          <Avatar className="size-[42px] border-none">
            {user.avatar && <AvatarImage className="rounded-[4px]" src={`${env.BACKEND_BASE_URL}${user.avatar}`} />}
            <AvatarFallback className="uppercase">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
          </Avatar>
        ),
      },
      {
        key: "name",
        label: "Name",
        render: (user) => (
          <div>
            <p className="text-sm font-semibold text-[#101828] font-syne">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground font-syne">{user.email}</p>
          </div>
        ),
      },
      {
        key: "phone",
        label: "Phone",
        render: (user) => <span className="text-sm text-[#4A5565] font-syne">{user.phone || "—"}</span>,
      },
      {
        key: "role",
        label: "Role",
        render: (user) => <RoleBadge role={user.role} />,
      },
      {
        key: "joined",
        label: "Joined",
        render: (user) => (
          <span className="text-sm text-[#4A5565] font-syne">
            {new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6 sm:p-8 p-4 h-full overflow-hidden">
      <ListHeader title="Users" subtitle="Manage all users on your platform" showButton={false} />

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-100 px-4 py-3 text-sm text-error-700">
          {error}
          <button onClick={refresh} className="ml-2 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      <SearchFilter
        searchInput={searchInput}
        handleSearchChange={handleSearchChange}
        handleSearchClear={handleSearchClear}
        placeholder="Search users by name or email.."
      />

      <DataTable<User>
        className="flex-1 min-h-0"
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        emptyMessage={error ? undefined : "No users found."}
        pagination={pagination}
        onPageSizeChange={handlePageSizeChange}
        itemLabel="users"
        actionsHeader="Actions"
        actions={(user) =>
          user.role !== "ADMIN" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() => handleDelete(user)}
              title="Delete user"
            >
              <Trash2 className="size-4 text-[#E7000B]" />
            </Button>
          )
        }
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-error-600" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.firstName} {userToDelete?.lastName}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
