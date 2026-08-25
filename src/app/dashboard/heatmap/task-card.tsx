"use client";

import { useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import type { HeatmapInstance } from "@/lib/dashboard/queries";
import { getDisplayStatus } from "./status";
import { StatusIcon } from "./status-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { FocusBatchModal } from "./focus-batch-modal";

export function TaskCard({ instance }: { instance: HeatmapInstance }) {
  const [open, setOpen] = useState(false);
  const status = getDisplayStatus(instance);
  const color = instance.task?.category?.color ?? "var(--category-conocimiento)";
  const actionable = status === "pendiente" || status === "atrasado";
  // Cuerpo tiene su propio dashboard de calistenia (mapa semanal, rutina
  // guiada, fotos de progreso) — no el batch de foco genérico.
  const isCuerpo = instance.task?.title === "Cuerpo";

  return (
    <>
      <Card
        className="overflow-hidden transition-spring duration-300 hover:-translate-y-0.5"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[15px] font-medium">
              {instance.task?.title ?? "Tarea"}
            </span>
            <StatusIcon status={status} />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{instance.task?.category?.name}</span>
            <span>
              {instance.points_awarded ?? instance.task?.points_base ?? 0} pts
            </span>
          </div>
          {actionable && isCuerpo && (
            <Link
              href="/materias/cuerpo"
              className={buttonVariants({ size: "sm", variant: "secondary", className: "mt-1 gap-1.5" })}
            >
              <Play className="h-3.5 w-3.5" />
              Ir al dashboard de Cuerpo
            </Link>
          )}
          {actionable && !isCuerpo && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-1 gap-1.5"
              onClick={() => setOpen(true)}
            >
              <Play className="h-3.5 w-3.5" />
              Empezar batch de foco
            </Button>
          )}
        </CardContent>
      </Card>

      {open && !isCuerpo && (
        <FocusBatchModal instance={instance} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
