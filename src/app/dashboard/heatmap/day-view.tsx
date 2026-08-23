import type { HeatmapInstance } from "@/lib/dashboard/queries";
import { TaskCard } from "./task-card";

export function DayView({ instances }: { instances: HeatmapInstance[] }) {
  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-[15px] text-muted-foreground">
          Todavía no hay tareas asignadas para hoy.
        </p>
        <p className="text-sm text-muted-foreground">
          El motor de tareas las genera automáticamente todas las mañanas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {instances.map((instance) => (
        <TaskCard key={instance.id} instance={instance} />
      ))}
    </div>
  );
}
