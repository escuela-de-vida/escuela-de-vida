"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { randomDictationText } from "@/lib/typing/texts";
import { completeTypingTask } from "../actions";

const PREP_SECONDS = 30;

function Char({ expected, typed }: { expected: string; typed?: string }) {
  let cls = "text-muted-foreground";
  if (typed !== undefined) {
    cls = typed === expected ? "text-foreground" : "bg-red-500/20 text-red-500";
  }
  return <span className={cls}>{expected}</span>;
}

type Phase = "countdown" | "typing" | "saving";

/**
 * Reemplaza el batch de foco genérico para la tarea "Mecanografía y
 * dictado" del heatmap: cuenta regresiva de preparación, el dictado
 * sucede ACÁ mismo (no solo un timer), y al terminar cierra la
 * task_instance con el puntaje real (sección 7.4 + pedido de ajustes).
 */
export function DictationTask({
  taskInstanceId,
  color,
  onDone,
}: {
  taskInstanceId: string;
  color: string;
  onDone: (result: { points: number; wpm: number; accuracyPct: number }) => void;
}) {
  const [dictation] = useState(() => randomDictationText());
  const [phase, setPhase] = useState<Phase>("countdown");
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECONDS);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (phase !== "countdown") return;
    const id = setInterval(() => {
      setPrepRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setPhase("typing");
          setStartedAt(Date.now());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "typing") textareaRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "typing" || !startedAt) return;
    const id = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 200);
    return () => clearInterval(id);
  }, [phase, startedAt]);

  const liveWpm = useMemo(() => {
    if (!startedAt || elapsed < 1) return 0;
    const correctChars = [...dictation.text].filter((c, i) => typed[i] === c).length;
    return Math.round(correctChars / 5 / (elapsed / 60));
  }, [typed, dictation.text, startedAt, elapsed]);

  async function handleFinish() {
    if (!startedAt) return;
    setPhase("saving");
    try {
      const outcome = await completeTypingTask(
        taskInstanceId,
        dictation.text,
        typed,
        (Date.now() - startedAt) / 1000,
      );
      onDone(outcome);
    } catch {
      setPhase("typing");
    }
  }

  if (phase === "countdown") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-[15px] text-muted-foreground">
          Preparate — el dictado arranca en...
        </p>
        <span
          className="text-[64px] font-semibold tabular-nums"
          style={{ color }}
        >
          {prepRemaining}
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-4 px-6">
      <div className="flex items-center justify-between text-[13px] text-muted-foreground">
        <span>Dictado en curso</span>
        <span className="tabular-nums">{elapsed.toFixed(0)}s · {liveWpm} ppm</span>
      </div>
      <p className="rounded-lg bg-muted p-3 font-mono text-[15px] leading-relaxed">
        {[...dictation.text].map((c, i) => (
          <Char key={i} expected={c} typed={typed[i]} />
        ))}
      </p>
      <textarea
        ref={textareaRef}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder="Empezá a escribir acá..."
        className="min-h-24 w-full rounded-lg border border-border bg-background p-3 font-mono text-[15px] outline-none focus:ring-2 focus:ring-ring"
        spellCheck={false}
        disabled={phase === "saving"}
      />
      <Button
        onClick={handleFinish}
        disabled={phase === "saving" || typed.length === 0}
        className="w-full gap-2"
      >
        {phase === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
        Terminar
      </Button>
    </div>
  );
}
