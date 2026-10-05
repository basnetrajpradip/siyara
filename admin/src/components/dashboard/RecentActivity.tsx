import { Link } from "react-router"
import { BookOpen, Calendar, ShoppingCart, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatDistanceToNowStrict } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RecentActivity as RecentActivityData } from "@/types/dashboard"
import type { ConsultationStatus } from "@/types/consultation"
import { getConsultationStatusLabel, getConsultationTypeLabel } from "@/types/consultation"
import type { KnowledgeStatus } from "@/types/knowledge"
import { getKnowledgeStatusLabel } from "@/types/knowledge"
import { getOrderStatusLabel, ORDER_STATUS_COLORS } from "@/types/order"

type BadgeVariant = "default" | "success" | "warning" | "error" | "inactive" | "info"

const consultationBadge: Record<ConsultationStatus, BadgeVariant> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "error",
}

const knowledgeBadge: Record<KnowledgeStatus, BadgeVariant> = {
  DRAFT: "inactive",
  PUBLISHED: "success",
  ARCHIVED: "warning",
}

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  href: string
  badge: { label: string; variant: BadgeVariant }
  createdAt: string
}

interface ActivitySectionProps {
  label: string
  icon: LucideIcon
  iconClassName: string
  items: ActivityItem[]
}

function ActivitySection({ label, icon: Icon, iconClassName, items }: ActivitySectionProps) {
  return (
    <section>
      <h4 className="mb-1 flex items-center gap-2 font-syne text-sm font-semibold text-primary-900">
        <span className={`flex size-6 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon className="size-3.5" />
        </span>
        {label}
      </h4>
      {items.length === 0 ? (
        <p className="py-3 text-xs text-muted-foreground text-center">Nothing yet</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5 py-2">
              <div className="min-w-0 flex-1">
                <Link
                  to={item.href}
                  className="block truncate font-syne text-sm font-medium text-primary-900 hover:text-primary-600"
                >
                  {item.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
                <time className="text-[11px] text-muted-foreground">
                  {formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: true })}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

interface RecentActivityProps {
  data: RecentActivityData
}

export function RecentActivity({ data }: RecentActivityProps) {
  const orders: ActivityItem[] = data.orders.map((order) => ({
    id: order.id,
    title: order.orderNumber,
    subtitle: order.customerName,
    href: `/orders/${order.id}`,
    badge: { label: getOrderStatusLabel(order.status), variant: ORDER_STATUS_COLORS[order.status].badge },
    createdAt: order.createdAt,
  }))

  const customers: ActivityItem[] = data.customers.map((customer) => ({
    id: customer.id,
    title: `${customer.firstName} ${customer.lastName}`.trim(),
    subtitle: customer.email,
    href: "/users",
    badge: { label: "Customer", variant: "info" },
    createdAt: customer.createdAt,
  }))

  const consultations: ActivityItem[] = data.consultations.map((consultation) => ({
    id: consultation.id,
    title: consultation.patientName,
    subtitle: getConsultationTypeLabel(consultation.consultationType),
    href: `/consultations/${consultation.id}`,
    badge: {
      label: getConsultationStatusLabel(consultation.status),
      variant: consultationBadge[consultation.status],
    },
    createdAt: consultation.createdAt,
  }))

  const knowledge: ActivityItem[] = data.knowledge.map((article) => ({
    id: article.id,
    title: article.title,
    subtitle: "Knowledge article",
    href: `/knowledge-base/${article.id}/edit`,
    badge: { label: getKnowledgeStatusLabel(article.status), variant: knowledgeBadge[article.status] },
    createdAt: article.publishedAt ?? article.createdAt,
  }))

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          <ActivitySection
            label="Orders"
            icon={ShoppingCart}
            iconClassName="bg-primary-100 text-primary-600"
            items={orders}
          />
          <ActivitySection label="Customers" icon={Users} iconClassName="bg-info-100 text-info-700" items={customers} />
          <ActivitySection
            label="Consultations"
            icon={Calendar}
            iconClassName="bg-secondary-100 text-secondary-700"
            items={consultations}
          />
          <ActivitySection
            label="Knowledge"
            icon={BookOpen}
            iconClassName="bg-success-100 text-success-700"
            items={knowledge}
          />
        </div>
      </CardContent>
    </Card>
  )
}
