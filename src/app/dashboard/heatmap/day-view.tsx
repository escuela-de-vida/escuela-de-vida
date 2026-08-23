import type { HeatmapInstance } from "@/lib/dashboard/queries";
import { getDisplayStatus } from "./status";
import { StatusIcon } from "./status-icon";
import { Card, CardContent } from "@/components/ui/card";

export function DayView({ instances }: { instances: HeatmapInstance[] }) {
  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-[15px] text-muted-foreground">
          Todavía no hay tareas asignadas para hoy.
        </p>
        <p className="text-sm text-muted-foreground">
          El motor de tareas las va a generar automáticamente (próxima fase).
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {instances.map((instance) => {
        const status = getDisplayStatus(instance);
        const color =
          instance.task?.category?.color ?? "var(--category-conocimiento)";
        return (
          <Card
            key={instance.id}
            className="overflow-hidden transition-spring duration-300 hover:-translate-y-0.5"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-medium">
                  {instance.task?.title ?? "Tarea"}
                </span>
                <StatusIcon status={status} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{instance.task?.category?.name}</span>
                <span>
                  {instance.points_awarded ?? instance.task?.points_base ?? 0}{" "}
                  pts
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
