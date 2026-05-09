"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { parseIDR } from "@/lib/formatters";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "Rp 0",
  className,
  disabled,
  id,
}: CurrencyInputProps): React.JSX.Element {
  const [displayValue, setDisplayValue] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  // Sync display when value changes externally and input is not focused
  React.useEffect(() => {
    if (!focused) {
      setDisplayValue(value === 0 ? "" : formatForDisplay(value));
    }
  }, [value, focused]);

  function formatForDisplay(num: number): string {
    return new Intl.NumberFormat("id-ID").format(num);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = parseIDR(raw);
    onChange(isNaN(parsed) ? 0 : parsed);
  }

  function handleFocus(): void {
    setFocused(true);
    // Strip formatting on focus for easier editing
    if (value !== 0) {
      setDisplayValue(String(value));
    }
  }

  function handleBlur(): void {
    setFocused(false);
    if (value !== 0) {
      setDisplayValue(formatForDisplay(value));
    } else {
      setDisplayValue("");
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        Rp
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder.replace("Rp ", "")}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    </div>
  );
}
