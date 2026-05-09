import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/formatters";

interface CurrencyDisplayProps {
  amount: number;
  showDecimals?: boolean;
  className?: string;
  colorize?: boolean;
}

export function CurrencyDisplay({
  amount,
  showDecimals = false,
  className,
  colorize = false,
}: CurrencyDisplayProps): React.JSX.Element {
  const colorClass = colorize
    ? amount > 0
      ? "text-emerald-600"
      : amount < 0
        ? "text-red-600"
        : "text-muted-foreground"
    : "";

  return (
    <span className={cn(colorClass, className)}>
      {amount < 0 ? "-" : colorize && amount > 0 ? "+" : ""}
      {formatIDR(Math.abs(amount), showDecimals)}
    </span>
  );
}
