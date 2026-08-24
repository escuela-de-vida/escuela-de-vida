"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { completeModule } from "../actions";
import type { ModuleWithStatus } from "@/lib/curriculum/types";

export function ModuleInteraction({
  module,
  color,
}: {
  module: ModuleWithStatus;
  color: string;
}) {
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<number[]>(
    Array(module.content.quiz?.length ?? 0).fill(-1),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const result = await completeModule(module.id, {
        text: module.content.kind !== "quiz" ? text : undefined,
        quizAnswers: module.content.kind === "quiz" ? answers : undefined,
      });
      setPointsEarned(result.points);
      setFeedback(result.feedback);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Sparkles className="h-8 w-8" style={{ color }} />
        <p className="text-[17px] font-semibold">
          ¡Sumaste {pointsEarned} pts!
        </p>
        {feedback && (
          <p className="max-w-md rounded-lg bg-muted p-3 text-left text-sm text-muted-foreground">
            {feedback}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          La página se actualiza sola con el próximo módulo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="whitespace-pre-line text-[15px] leading-relaxed">
        {module.content.instructions}
      </p>

      {module.content.kind === "quiz" && module.content.quiz && (
        <div className="flex flex-col gap-5">
          {module.content.quiz.map((q, qi) => (
            <div key={qi} className="flex flex-col gap-2">
              <Label>{q.question}</Label>
              <div className="flex flex-col gap-1.5">
                {q.options.map((option, oi) => (
                  <button
                    type="button"
                    key={oi}
                    onClick={() =>
                      setAnswers((prev) => {
                        const next = [...prev];
                        next[qi] = oi;
                        return next;
                      })
                    }
                    className={`rounded-lg border px-3 py-2 text-left text-[14px] transition-spring duration-150 ${
                      answers[qi] === oi
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {module.content.kind !== "quiz" && (
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí acá tu respuesta..."
          className="min-h-32"
        />
      )}

      {module.content.rubric && module.content.rubric.length > 0 && (
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">
            Qué vamos a mirar:
          </p>
          <ul className="list-disc pl-4">
            {module.content.rubric.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={
          status === "saving" ||
          (module.content.kind === "quiz" && answers.includes(-1))
        }
        className="gap-2 self-start"
      >
        {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
        Completar módulo
      </Button>
    </form>
  );
}
