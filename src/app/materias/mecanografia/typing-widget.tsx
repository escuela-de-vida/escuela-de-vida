"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { randomDictationText } from "@/lib/typing/texts";
import { submitTypingSession } from "./actions";

export type TypingHistoryRow = {
  wpm: number;
  accuracy_pct: number;
  created_at: string;
};

function Char({ expected, typed }: { expected: string; typed?: string }) {
  let cls = "text-muted-foreground";
  if (typed !== undefined) {
    cls = typed === expected ? "text-foreground" : "bg-red-500/20 text-red-500";
  }
  return <span className={cls}>{expected}</span>;
}

export function TypingWidget({
  history,
  color,
}: {
  history: TypingHistoryRow[];
  color: string;
}) {
  const [dictation, setDictation] = useState(() => randomDictationText());
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{
    wpm: number;
    accuracyPct: number;
    points: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!startedAt || result) return;
    const id = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 200);
    return () => clearInterval(id);
  }, [startedAt, result]);

  function handleChange(value: string) {
    if (result) return;
    if (!startedAt && value.length > 0) setStartedAt(Date.now());
    setTyped(value);
  }

  async function handleFinish() {
    if (!startedAt) return;
    setSaving(true);
    try {
      const outcome = await submitTypingSession({
        dictationText: dictation.text,
        typedText: typed,
        durationSeconds: (Date.now() - startedAt) / 1000,
      });
      setResult(outcome);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setDictation(randomDictationText());
    setTyped("");
    setStartedAt(null);
    setElapsed(0);
    setResult(null);
    inputRef.current?.focus();
  }

  const liveWpm = useMemo(() => {
    if (!startedAt || elapsed < 1) return 0;
    const correctChars = [...dictation.text].filter(
      (c, i) => typed[i] === c,
    ).length;
    return Math.round(correctChars / 5 / (elapsed / 60));
  }, [typed, dictation.text, startedAt, elapsed]);

  const recentAvgWpm = history.length
    ? Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[16px]">
              <Keyboard className="h-4 w-4" style={{ color }} />
              Dictado libre
            </CardTitle>
            <span className="text-[13px] tabular-nums text-muted-foreground">
              {startedAt && !result ? `${elapsed.toFixed(0)}s · ${liveWpm} ppm` : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {result ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-[28px] font-semibold tabular-nums">
                {result.wpm} PPM
              </p>
              <p className="text-[15px] text-muted-foreground">
                {result.accuracyPct}% de precisión · +{result.points} pts
              </p>
              <Button onClick={handleReset} variant="secondary" className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Otro texto
              </Button>
            </div>
          ) : (
            <>
              <p className="rounded-lg bg-muted p-3 font-mono text-[15px] leading-relaxed">
                {[...dictation.text].map((c, i) => (
                  <Char key={i} expected={c} typed={typed[i]} />
                ))}
              </p>
              <textarea
                ref={inputRef}
                value={typed}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Empezá a escribir acá..."
                className="min-h-24 w-full rounded-lg border border-border bg-background p-3 font-mono text-[15px] outline-none focus:ring-2 focus:ring-ring"
                spellCheck={false}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleFinish}
                  disabled={!startedAt || saving}
                  className="gap-1.5"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Terminar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-[15px] font-medium text-muted-foreground">
            Progreso histórico {recentAvgWpm !== null && `· promedio ${recentAvgWpm} PPM`}
          </h2>
          <div className="flex items-end gap-1.5">
            {[...history].reverse().slice(-20).map((h, i) => (
              <div
                key={i}
                className="w-3 rounded-t"
                style={{
                  height: `${Math.max(8, Math.min(80, h.wpm))}px`,
                  background: color,
                  opacity: 0.4 + (h.accuracy_pct / 100) * 0.6,
                }}
                title={`${h.wpm} PPM · ${h.accuracy_pct}%`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
