import type { HeatmapInstance } from "@/lib/dashboard/queries";
import {
  addDays,
  endOfMonth,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toISODate,
  weekdayLabel,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

export function MonthView({
  month,
  instances,
}: {
  month: Date;
  instances: HeatmapInstance[];
}) {
  const today = new Date();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart);

  const totalDays =
    Math.ceil(
      (addDays(startOfWeek(monthEnd), 6).getTime() - gridStart.getTime()) /
        86_400_000,
    ) + 1;
  const days = Array.from({ length: totalDays }, (_, i) =>
    addDays(gridStart, i),
  );

  const byDay = new Map<string, HeatmapInstance[]>();
  for (const instance of instances) {
    const key = instance.scheduled_date;
    byDay.set(key, [...(byDay.get(key) ?? []), instance]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="px-1 text-center text-[12px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {weekdayLabel(i)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const iso = toISODate(day);
          const dayInstances = byDay.get(iso) ?? [];
          const inMonth = day.getMonth() === month.getMonth();
          const isToday = isSameDay(day, today);
          const doneCount = dayInstances.filter(
            (i) => i.status === "hecho",
          ).length;

          const colors = [
            ...new Set(
              dayInstances
                .map((i) => i.task?.category?.color)
                .filter((c): c is string => Boolean(c)),
            ),
          ].slice(0, 4);

          return (
            <div
              key={iso}
              className={cn(
                "flex min-h-20 flex-col gap-1.5 rounded-lg border border-border p-2",
                !inMonth && "opacity-40",
                isToday && "border-primary/50 bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">
                  {day.getDate()}
                </span>
                {dayInstances.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {doneCount}/{dayInstances.length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {colors.map((color) => (
                  <span
                    key={color}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
