import Link from "next/link";
import { cn } from "@/lib/utils";

export type Timeframe = "dia" | "semana" | "mes" | "anio";

const OPTIONS: { value: Timeframe; label: string }[] = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "anio", label: "Año" },
];

export function TimeframeTabs({ active }: { active: Timeframe }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-muted p-1">
      {OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={`/dashboard?tf=${option.value}`}
          className={cn(
            "rounded-full px-4 py-1.5 text-[14px] font-medium transition-spring duration-200",
            active === option.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
