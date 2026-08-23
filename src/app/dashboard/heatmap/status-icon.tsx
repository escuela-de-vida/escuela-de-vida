import { CheckCircle2, Circle, AlertTriangle, RotateCcw, XCircle } from "lucide-react";
import type { DisplayStatus } from "./status";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  DisplayStatus,
  { icon: typeof CheckCircle2; className: string; label: string }
> = {
  hecho: {
    icon: CheckCircle2,
    className: "text-[var(--category-cuerpo)]",
    label: "Hecho",
  },
  atrasado: {
    icon: AlertTriangle,
    className: "text-[var(--category-creatividad)]",
    label: "Atrasado",
  },
  pendiente: {
    icon: Circle,
    className: "text-muted-foreground",
    label: "Pendiente",
  },
  no_hecho: {
    icon: XCircle,
    className: "text-muted-foreground/60",
    label: "No hecho",
  },
  reprogramado: {
    icon: RotateCcw,
    className: "text-muted-foreground",
    label: "Reprogramado",
  },
};

export function StatusIcon({
  status,
  className,
}: {
  status: DisplayStatus;
  className?: string;
}) {
  const { icon: Icon, className: colorClass, label } = CONFIG[status];
  return (
    <Icon
      className={cn("h-4 w-4 shrink-0", colorClass, className)}
      strokeWidth={2}
      aria-label={label}
    />
  );
}
