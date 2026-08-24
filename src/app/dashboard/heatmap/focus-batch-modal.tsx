"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, Loader2, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markTaskDone } from "../actions";
import type { HeatmapInstance } from "@/lib/dashboard/queries";
import { DictationTask } from "./dictation-task";
import { fireConfetti } from "@/lib/feedback/confetti";
import { playSuccessSound, playSubtleSound } from "@/lib/feedback/sound";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  const isDictation = instance.task?.title === "Mecanografía y dictado";
  const totalSeconds = Math.max((instance.task?.duration_minutes ?? 25) * 60, 1);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [phase, setPhase] = useState<Phase>("running");
  const [evidence, setEvidence] = useState("");
  const [photo, setPhoto] = useState<{ file: File; previewUrl: string } | null>(null);
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [typingResult, setTypingResult] = useState<{ wpm: number; accuracyPct: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isDictation) return;
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

  useEffect(() => {
    if (phase !== "saved") return;
    if (pointsEarned && pointsEarned >= 10) {
      fireConfetti(color);
      playSuccessSound();
    } else {
      playSubtleSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  async function handleConfirm() {
    setPhase("saving");
    try {
      const evidencePhoto = photo
        ? { base64Data: await fileToBase64(photo.file), mimeType: photo.file.type }
        : undefined;
      const result = await markTaskDone(instance.id, evidence, evidencePhoto);
      setPointsEarned(result.points);
      setPhotoFeedback(result.photoFeedback);
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

      {phase === "running" && isDictation && (
        <div className="flex flex-col items-center gap-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: color }}
          >
            <Compass className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <DictationTask
            taskInstanceId={instance.id}
            color={color}
            onDone={(result) => {
              setPointsEarned(result.points);
              setTypingResult({ wpm: result.wpm, accuracyPct: result.accuracyPct });
              setPhase("saved");
            }}
          />
        </div>
      )}

      {phase === "running" && !isDictation && (
        <div className="flex flex-col items-center gap-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: color }}
          >
            <Compass className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-[17px] font-medium">{instance.task?.title}</p>
            {instance.task?.description && (
              <p className="max-w-xs text-[14px] text-muted-foreground">
                {instance.task.description}
              </p>
            )}
          </div>
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setPhoto({ file, previewUrl: URL.createObjectURL(file) });
            }}
          />
          {photo ? (
            <div className="relative w-full max-w-[160px] self-center">
              <img
                src={photo.previewUrl}
                alt="Evidencia"
                className="w-full rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background text-muted-foreground shadow ring-1 ring-border hover:text-foreground"
                aria-label="Quitar foto"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-3.5 w-3.5" />
              Agregar foto
            </Button>
          )}
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
          {typingResult ? (
            <p className="max-w-xs text-[15px] text-muted-foreground">
              {typingResult.wpm} PPM · {typingResult.accuracyPct}% de precisión
            </p>
          ) : photoFeedback ? (
            <p className="max-w-xs rounded-lg bg-muted p-3 text-[14px] text-muted-foreground">
              {photoFeedback}
            </p>
          ) : (
            <p className="max-w-xs text-[15px] text-muted-foreground">
              Un paso más en tu expedición.
            </p>
          )}
          <Button onClick={onClose} variant="outline">
            Volver al mapa
          </Button>
        </div>
      )}
    </div>
  );
}
