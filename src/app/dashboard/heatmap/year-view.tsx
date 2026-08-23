import type { HeatmapInstance } from "@/lib/dashboard/queries";
import { monthLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function YearView({
  year,
  instances,
}: {
  year: number;
  instances: HeatmapInstance[];
}) {
  const today = new Date();
  const byMonth = new Map<number, HeatmapInstance[]>();
  for (const instance of instances) {
    const month = Number(instance.scheduled_date.slice(5, 7)) - 1;
    byMonth.set(month, [...(byMonth.get(month) ?? []), instance]);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }, (_, month) => {
        const monthInstances = byMonth.get(month) ?? [];
        const doneCount = monthInstances.filter(
          (i) => i.status === "hecho",
        ).length;
        const points = monthInstances.reduce(
          (sum, i) => sum + (i.points_awarded ?? 0),
          0,
        );
        const isCurrent =
          month === today.getMonth() && year === today.getFullYear();

        return (
          <div
            key={month}
            className={cn(
              "flex flex-col gap-2 rounded-xl border border-border p-4",
              isCurrent && "border-primary/50 bg-primary/5",
            )}
          >
            <span className="text-[15px] font-medium">
              {monthLabel(month)}
            </span>
            {monthInstances.length === 0 ? (
              <span className="text-sm text-muted-foreground/60">
                Sin actividad
              </span>
            ) : (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {doneCount}/{monthInstances.length} hechas
                </span>
                <span>{points} pts</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
