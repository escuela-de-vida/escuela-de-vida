import { CheckCircle2, Circle, Lock } from "lucide-react";
import type { ModuleWithStatus } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

export function ModulePath({
  modules,
  color,
}: {
  modules: ModuleWithStatus[];
  color: string;
}) {
  let lastStage: string | null = null;

  return (
    <div className="flex flex-col gap-1">
      {modules.map((module) => {
        const showStage = module.stage && module.stage !== lastStage;
        lastStage = module.stage ?? lastStage;

        return (
          <div key={module.id}>
            {showStage && (
              <p className="mb-1 mt-4 text-[12px] font-medium uppercase tracking-wide text-muted-foreground first:mt-0">
                {module.stage}
              </p>
            )}
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2",
                module.status === "actual" && "bg-muted",
                module.status === "bloqueado" && "opacity-40",
              )}
            >
              {module.status === "completado" && (
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  style={{ color }}
                  strokeWidth={2}
                />
              )}
              {module.status === "actual" && (
                <Circle
                  className="h-4 w-4 shrink-0"
                  style={{ color }}
                  strokeWidth={2}
                />
              )}
              {module.status === "bloqueado" && (
                <Lock
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={2}
                />
              )}
              <span
                className={cn(
                  "flex-1 text-[14px]",
                  module.status === "actual" && "font-medium",
                )}
              >
                {module.title}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {module.status === "completado"
                  ? `${module.pointsAwarded ?? module.points} pts`
                  : `${module.points} pts`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
