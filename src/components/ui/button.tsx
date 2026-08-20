import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 active:scale-[0.98]",
        outline:
          "border border-border-subtle bg-transparent hover:bg-hover text-content-primary hover:border-border-strong active:scale-[0.98]",
        secondary:
          "bg-surface text-content-secondary hover:text-content-primary hover:bg-hover border border-border-subtle active:scale-[0.98]",
        ghost:
          "hover:bg-hover text-content-secondary hover:text-content-primary",
        link:
          "text-accent underline-offset-4 hover:underline p-0 h-auto",
        accent:
          "bg-accent text-white hover:bg-accent-hover shadow-[0_0_12px_rgba(0,87,255,0.3)] active:scale-[0.98]",
        amber:
          "bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)] active:scale-[0.98]",
        cyber:
          "bg-[#FFD700] text-black font-black hover:bg-white shadow-[0_0_14px_rgba(255,215,0,0.3)] active:scale-[0.98] uppercase tracking-wider"
      },
      size: {
        default: "h-8 px-3 py-1.5",
        xs: "h-6 px-2 text-[10px] rounded-sm",
        sm: "h-7 px-2.5 text-[11px] rounded-sm",
        lg: "h-10 px-5 text-sm rounded-md",
        icon: "h-8 w-8 p-0 shrink-0",
        "icon-sm": "h-7 w-7 p-0 shrink-0",
        "icon-xs": "h-6 w-6 p-0 shrink-0"
      }
    },
    defaultVariants: {
      variant: "secondary",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { buttonVariants };
