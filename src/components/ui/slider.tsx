import * as React from "react";
import { cn } from "../../lib/utils";

export interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  className?: string;
  formatValue?: (val: number) => string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  defaultValue,
  disabled = false,
  onChange,
  className,
  formatValue
}) => {
  const numVal = typeof value === "number" && !isNaN(value) ? value : Number(value) || 0;

  const percentage = Math.min(
    100,
    Math.max(0, ((numVal - min) / (max - min)) * 100)
  );

  const displayVal = formatValue
    ? formatValue(numVal)
    : `${Number.isInteger(step) ? numVal : numVal.toFixed(2)}${unit}`;

  const handleDoubleClick = () => {
    if (defaultValue !== undefined && !disabled) {
      onChange(defaultValue);
    }
  };

  return (
    <div className={cn("space-y-1.5 w-full select-none", className)}>
      {label && (
        <div className="flex items-center justify-between text-[11px]">
          <span
            onDoubleClick={handleDoubleClick}
            className="font-medium text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
            title={defaultValue !== undefined ? `Çift tıkla sıfırla: ${defaultValue}${unit}` : undefined}
          >
            {label}
          </span>
          <span className="font-mono text-[10px] text-content-tertiary bg-white/[0.04] px-1.5 py-0.5 rounded border border-border-subtle">
            {displayVal}
          </span>
        </div>
      )}
      <div className="relative flex items-center h-4 group">
        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border-subtle">
          <div
            className="h-full bg-accent group-hover:bg-accent-hover transition-all rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numVal}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        {/* Thumb indicator on hover/focus */}
        <div
          className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_8px_rgba(0,0,0,0.8)] border border-border-strong pointer-events-none transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
