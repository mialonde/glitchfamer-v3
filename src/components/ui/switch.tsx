import * as React from "react";
import { cn } from "../../lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      disabled = false,
      id,
      className,
      label,
      description
    },
    ref
  ) => {
    return (
      <div className={cn("flex items-center justify-between gap-3", className)}>
        {label && (
          <div className="flex flex-col select-none">
            <span className="text-xs font-medium text-content-primary leading-none">
              {label}
            </span>
            {description && (
              <span className="text-[10px] text-content-tertiary mt-1">
                {description}
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          role="switch"
          id={id}
          ref={ref}
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-accent" : "bg-surface border border-border-subtle"
          )}
        >
          <span
            className={cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
              checked ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
    );
  }
);
Switch.displayName = "Switch";
