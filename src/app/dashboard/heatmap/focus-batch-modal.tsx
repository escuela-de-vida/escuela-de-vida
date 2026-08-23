"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markTaskDone } from "../actions";
import type { HeatmapInstance } from "@/lib/dashboard/queries";

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Phase = "running" | "done-pending-confirm" | "saving" | "saved";

export function FocusBatchModal({
  instance,
  onClose,
}: {
  instance: HeatmapInstance;
  onClose: () => void;
}) {
  const totalSeconds = Math.max((instance.task?.duration_minutes ?? 25) * 60, 1);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [phase, setPhase] = useState<Phase>("running");
  const [evidence, setEvidence] = useState("");
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("done-pending-confirm");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = 1 - remaining / totalSeconds;
  const color = instance.task?.category?.color ?? "var(--category-conocimiento)";

  async function handleConfirm() {
    setPhase("saving");
    try {
      const result = await markTaskDone(instance.id, evidence);
      setPointsEarned(result.points);
      setPhase("saved");
    } catch {
      setPhase("done-pending-confirm");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl">
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-spring duration-200 hover:bg-muted hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      {phase === "running" && (
        <div className="flex flex-col items-center gap-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: color }}
          >
            <Compass className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <p className="text-[17px] font-medium text-muted-foreground">
            {instance.task?.title}
          </p>
          <div className="relative flex h-56 w-56 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke="var(--border)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute text-[40px] font-semibold tabular-nums tracking-tight">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Pantalla sin distracciones — dedicale este tiempo a la tarea. Kai
            te acompaña.
          </p>
        </div>
      )}

      {(phase === "done-pending-confirm" || phase === "saving") && (
        <div className="flex w-full max-w-sm flex-col items-center gap-5 px-6 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: color }}
          >
            <Compass className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight">
            ¡Terminaste el batch!
          </h2>
          <p className="text-[15px] text-muted-foreground">
            {instance.task?.title} — si querés, dejá una nota de lo que
            hiciste.
          </p>
          <Textarea
            placeholder="Opcional"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            className="min-h-24"
          />
          <Button
            onClick={handleConfirm}
            disabled={phase === "saving"}
            className="w-full gap-2"
          >
            {phase === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
            Marcar como hecho
          </Button>
        </div>
      )}

      {phase === "saved" && (
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: color }}
          >
            <Compass className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight">
            ¡Sumaste {pointsEarned} pts!
          </h2>
          <p className="max-w-xs text-[15px] text-muted-foreground">
            Un paso más en tu expedición.
          </p>
          <Button onClick={onClose} variant="outline">
            Volver al mapa
          </Button>
        </div>
      )}
    </div>
  );
}
