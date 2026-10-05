import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex justify-center items-center rounded-full px-3 py-0.5 text-xs font-semibold font-syne whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        success: "bg-success-100 text-success-700",
        warning: "bg-warning-100 text-warning-700",
        error: "bg-error-100 text-error-700",
        inactive: "bg-[#F3F4F6] text-[#1E2939]",
        info: "bg-info-100 text-info-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
