import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white/[0.08] text-content-primary hover:bg-white/[0.12]",
        secondary:
          "border border-border-subtle bg-surface text-content-secondary hover:text-content-primary",
        destructive:
          "border border-red-500/30 bg-red-500/10 text-red-400",
        outline:
          "border border-border-subtle text-content-secondary bg-transparent",
        accent:
          "border border-accent/40 bg-accent/15 text-accent-foreground shadow-[0_0_8px_rgba(0,87,255,0.25)]",
        cyber:
          "border border-amber-400/40 bg-amber-400/15 text-amber-300 shadow-[0_0_8px_rgba(255,215,0,0.2)]",
        success:
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}


export { badgeVariants };
