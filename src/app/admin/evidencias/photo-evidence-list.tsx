"use client";

import { useState } from "react";
import { Loader2, Sparkles, CircleAlert, ImageOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { overridePhotoScore } from "./actions";

export type PhotoSubmission = {
  id: string;
  studentId: string;
  studentName: string;
  taskInstanceId: string;
  taskTitle: string;
  currentPoints: number;
  signedUrl: string | null;
  aiEvaluation: { genuine?: boolean; feedback?: string; pending?: boolean } | null;
  adminOverrideScore: number | null;
  adminOverrideComment: string | null;
  createdAt: string;
};

function OverrideForm({ submission }: { submission: PhotoSubmission }) {
  const [points, setPoints] = useState(
    String(submission.adminOverrideScore ?? submission.currentPoints),
  );
  const [comment, setComment] = useState(submission.adminOverrideComment ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await overridePhotoScore({
        submissionId: submission.id,
        studentId: submission.studentId,
        taskInstanceId: submission.taskInstanceId,
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

export function PhotoEvidenceList({
  submissions,
}: {
  submissions: PhotoSubmission[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {submissions.map((s) => (
        <Card key={s.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px]">{s.taskTitle}</CardTitle>
                <CardDescription>{s.studentName}</CardDescription>
              </div>
              {s.aiEvaluation?.pending ? (
                <Badge variant="outline" className="gap-1.5">
                  <CircleAlert className="h-3.5 w-3.5" />
                  Sin evaluar
                </Badge>
              ) : s.aiEvaluation?.genuine === false ? (
                <Badge variant="destructive" className="gap-1.5">
                  <CircleAlert className="h-3.5 w-3.5" />
                  Revisar
                </Badge>
              ) : s.aiEvaluation ? (
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  IA
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {s.signedUrl ? (
              <img
                src={s.signedUrl}
                alt={s.taskTitle}
                className="max-h-64 w-full rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                <ImageOff className="h-5 w-5" />
              </div>
            )}
            {s.aiEvaluation?.feedback && (
              <p className="rounded-lg bg-muted p-3 text-sm">
                {s.aiEvaluation.feedback}
              </p>
            )}
            <OverrideForm submission={s} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
