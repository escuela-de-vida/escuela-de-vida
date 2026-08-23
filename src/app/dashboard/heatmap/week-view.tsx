import type { HeatmapInstance } from "@/lib/dashboard/queries";
import { addDays, isSameDay, toISODate, weekdayLabel } from "@/lib/dates";
import { getDisplayStatus } from "./status";
import { StatusIcon } from "./status-icon";
import { cn } from "@/lib/utils";

export function WeekView({
  weekStart,
  instances,
}: {
  weekStart: Date;
  instances: HeatmapInstance[];
}) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const byDay = new Map<string, HeatmapInstance[]>();
  for (const instance of instances) {
    const key = instance.scheduled_date;
    byDay.set(key, [...(byDay.get(key) ?? []), instance]);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {days.map((day) => {
        const iso = toISODate(day);
        const dayInstances = byDay.get(iso) ?? [];
        const isToday = isSameDay(day, today);

        return (
          <div
            key={iso}
            className={cn(
              "flex flex-col gap-2 rounded-xl border border-border p-3",
              isToday && "border-primary/50 bg-primary/5",
            )}
          >
            <div className="flex items-baseline justify-between">
              <span
                className={cn(
                  "text-[13px] font-medium uppercase tracking-wide text-muted-foreground",
                  isToday && "text-primary",
                )}
              >
                {weekdayLabel(day.getDay() === 0 ? 6 : day.getDay() - 1)}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {day.getDate()}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {dayInstances.length === 0 && (
                <span className="text-xs text-muted-foreground/60">—</span>
              )}
              {dayInstances.map((instance) => {
                const status = getDisplayStatus(instance);
                const color =
                  instance.task?.category?.color ??
                  "var(--category-conocimiento)";
                return (
                  <div
                    key={instance.id}
                    className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: color }}
                      aria-hidden
                    />
                    <span className="flex-1 truncate">
                      {instance.task?.title}
                    </span>
                    <StatusIcon status={status} className="h-3.5 w-3.5" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
