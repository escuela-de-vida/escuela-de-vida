"use client";

import { useState } from "react";
import { Compass, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationRead, submitQuoteRewrite } from "./actions";
import { playSubtleSound, playRetrySound } from "@/lib/feedback/sound";

export function MentorBanner({
  id,
  title,
  body,
  quote,
  initiallyRead,
}: {
  id: string;
  title: string;
  body: string;
  quote: string;
  initiallyRead: boolean;
}) {
  const [dismissed, setDismissed] = useState(initiallyRead);
  const [showRewrite, setShowRewrite] = useState(false);
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "retry">("idle");
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    markNotificationRead(id);
  }

  async function handleRewriteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const result = await submitQuoteRewrite(typed);
      if (result.success) {
        setPointsEarned(result.points);
        setStatus("done");
        playSubtleSound();
      } else {
        setStatus("retry");
        playRetrySound();
      }
    } catch {
      setStatus("retry");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/50 px-5 py-4">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--category-mente)" }}
        >
          <Compass className="h-4 w-4 text-white" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-medium">{title}</p>
          <p className="mt-0.5 text-[14px] leading-relaxed text-muted-foreground">
            {body}
          </p>
          {status !== "done" && !showRewrite && (
            <button
              onClick={() => setShowRewrite(true)}
              className="mt-2 text-[13px] font-medium text-primary hover:underline"
            >
              Reescribir la frase (+{3} pts)
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Cerrar"
          className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showRewrite && status !== "done" && (
        <form onSubmit={handleRewriteSubmit} className="ml-11 flex flex-col gap-2">
          <textarea
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={`Escribí de nuevo: "${quote}"`}
            className="min-h-16 w-full rounded-lg border border-border bg-background p-2.5 text-[13px] outline-none focus:ring-2 focus:ring-ring"
          />
          {status === "retry" && (
            <p className="text-[12px] text-muted-foreground">
              Casi — revisá bien la frase y probá de nuevo.
            </p>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={status === "saving" || !typed.trim()}
            className="w-fit gap-1.5"
          >
            {status === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Sumar puntos
          </Button>
        </form>
      )}

      {status === "done" && (
        <p className="ml-11 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--category-mente)" }} />
          +{pointsEarned} pts — ya la vas a tener incorporada.
        </p>
      )}
    </div>
  );
}
