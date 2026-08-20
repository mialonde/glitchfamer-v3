import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-2.5 flex items-center pointer-events-none text-content-tertiary">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-8 w-full rounded-md border border-border-subtle bg-surface px-3 py-1.5 text-xs text-content-primary shadow-sm transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-content-tertiary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-8",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
