"use client";

import { useState } from "react";
import { Loader2, Sparkles, CircleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { overrideReadingScore } from "./actions";

export type ReadingReview = {
  id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  pointsBase: number;
  reviewText: string;
  aiEvaluation: {
    comprension?: number;
    pensamiento_critico?: number;
    esfuerzo?: number;
    feedback?: string;
    percentage?: number;
    pending?: boolean;
  } | null;
  adminOverrideScore: number | null;
  adminOverrideComment: string | null;
  finishedAt: string | null;
};

function OverrideForm({ review }: { review: ReadingReview }) {
  const suggested =
    review.aiEvaluation?.percentage != null
      ? Math.max(1, Math.round((review.pointsBase * review.aiEvaluation.percentage) / 100))
      : review.pointsBase;

  const [points, setPoints] = useState(
    String(review.adminOverrideScore ?? suggested),
  );
  const [comment, setComment] = useState(review.adminOverrideComment ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await overrideReadingScore({
        bookProgressId: review.id,
        studentId: review.studentId,
        bookId: review.bookId,
        newPoints: Number(points) || 0,
        comment,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border pt-3">
      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-muted-foreground">Puntos</label>
        <Input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-20"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label className="text-[12px] text-muted-foreground">
          Comentario (opcional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-9"
        />
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {saved ? "Guardado" : "Ajustar puntaje"}
      </Button>
    </div>
  );
}

export function EvidenceList({ reviews }: { reviews: ReadingReview[] }) {
  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[16px]">
                  {review.bookTitle}
                </CardTitle>
                <CardDescription>{review.studentName}</CardDescription>
              </div>
              {review.aiEvaluation?.pending ? (
                <Badge variant="outline" className="gap-1.5">
                  <CircleAlert className="h-3.5 w-3.5" />
                  Sin evaluar (falta GEMINI_API_KEY)
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {review.aiEvaluation?.percentage}% · IA
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {review.reviewText}
            </p>
            {review.aiEvaluation?.feedback && (
              <p className="rounded-lg bg-muted p-3 text-sm">
                {review.aiEvaluation.feedback}
              </p>
            )}
            {review.aiEvaluation && !review.aiEvaluation.pending && (
              <div className="flex gap-3 text-[12px] text-muted-foreground">
                <span>Comprensión: {review.aiEvaluation.comprension}/25</span>
                <span>
                  Pensamiento crítico: {review.aiEvaluation.pensamiento_critico}/25
                </span>
                <span>Esfuerzo: {review.aiEvaluation.esfuerzo}/25</span>
              </div>
            )}
            <OverrideForm review={review} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
