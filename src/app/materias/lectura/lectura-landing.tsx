"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { fireConfetti } from "@/lib/feedback/confetti";
import { playSuccessSound, playSubtleSound } from "@/lib/feedback/sound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { startReading, finishReading } from "./actions";

export type BookWithProgress = {
  id: string;
  title: string;
  author: string | null;
  genres: string[];
  language: string;
  synopsis: string | null;
  status: "por_leer" | "leyendo" | "leido";
  pointsEarned: number | null;
};

export function LecturaLanding({
  books,
  questions,
  color,
}: {
  books: BookWithProgress[];
  questions: string[];
  color: string;
}) {
  const [reviewFor, setReviewFor] = useState<BookWithProgress | null>(null);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [result, setResult] = useState<{
    points: number;
    pending: boolean;
    feedback: string | null;
  } | null>(null);

  useEffect(() => {
    if (!result) return;
    if (result.points >= 10) {
      fireConfetti(color);
      playSuccessSound();
    } else {
      playSubtleSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  async function handleStart(book: BookWithProgress) {
    setBusyId(book.id);
    try {
      await startReading(book.id);
    } finally {
      setBusyId(null);
    }
  }

  function openReview(book: BookWithProgress) {
    setReviewFor(book);
    setReview("");
    setResult(null);
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewFor) return;
    setSaving(true);
    try {
      const outcome = await finishReading(reviewFor.id, review);
      setResult(outcome);
    } finally {
      setSaving(false);
    }
  }

  const groups: { key: BookWithProgress["status"]; label: string }[] = [
    { key: "leyendo", label: "Leyendo ahora" },
    { key: "por_leer", label: "Para leer" },
    { key: "leido", label: "Leídos" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => {
        const items = books.filter((b) => b.status === group.key);
        if (items.length === 0) return null;
        return (
          <div key={group.key} className="flex flex-col gap-3">
            <h2 className="text-[15px] font-medium text-muted-foreground">
              {group.label} ({items.length})
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((book) => (
                <Card key={book.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <CardTitle className="text-[15px]">
                          {book.title}
                        </CardTitle>
                        {book.author && (
                          <CardDescription>{book.author}</CardDescription>
                        )}
                      </div>
                      {book.status === "leido" && (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          style={{ color }}
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1">
                      {book.genres.slice(0, 3).map((g) => (
                        <Badge key={g} variant="outline" className="text-[11px]">
                          {g.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                    {book.status === "por_leer" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1.5"
                        disabled={busyId === book.id}
                        onClick={() => handleStart(book)}
                      >
                        {busyId === book.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <BookOpen className="h-3.5 w-3.5" />
                        )}
                        Empezar a leer
                      </Button>
                    )}
                    {book.status === "leyendo" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openReview(book)}
                      >
                        Terminé — dejar reseña
                      </Button>
                    )}
                    {book.status === "leido" && (
                      <span className="text-sm text-muted-foreground">
                        {book.pointsEarned} pts
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      <Dialog
        open={!!reviewFor}
        onOpenChange={(open) => !open && setReviewFor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewFor?.title}</DialogTitle>
          </DialogHeader>
          {result ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-1 py-2 text-center">
                <CheckCircle2 className="h-8 w-8" style={{ color }} />
                <p className="text-[17px] font-semibold">
                  +{result.points} pts
                </p>
              </div>
              {result.feedback && (
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  {result.feedback}
                </p>
              )}
              {result.pending && (
                <p className="text-[13px] text-muted-foreground">
                  Un adulto va a revisar tu reseña — los puntos ya son tuyos
                  igual, esto es solo para el feedback.
                </p>
              )}
              <DialogFooter>
                <Button onClick={() => setReviewFor(null)}>Listo</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleFinish} className="flex flex-col gap-4">
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">
                  Para pensar (no hace falta contestar todas):
                </p>
                <ul className="list-disc pl-4">
                  {questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Contanos qué te pareció el libro..."
                className="min-h-32"
                required
              />
              <DialogFooter>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar reseña
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
