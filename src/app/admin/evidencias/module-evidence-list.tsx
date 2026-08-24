"use client";

import { useState } from "react";
import { Loader2, Sparkles, CircleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { overrideModuleScore } from "./actions";

export type ModuleSubmission = {
  id: string;
  studentId: string;
  studentName: string;
  moduleId: string;
  moduleTitle: string;
  categoryName: string | null;
  pointsBase: number;
  text: string;
  aiEvaluation: {
    scores?: number[];
    feedback?: string;
    percentage?: number;
    pending?: boolean;
  } | null;
  adminOverrideScore: number | null;
  adminOverrideComment: string | null;
  createdAt: string;
};

function OverrideForm({ submission }: { submission: ModuleSubmission }) {
  const suggested =
    submission.aiEvaluation?.percentage != null
      ? Math.max(1, Math.round((submission.pointsBase * submission.aiEvaluation.percentage) / 100))
      : submission.pointsBase;

  const [points, setPoints] = useState(
    String(submission.adminOverrideScore ?? suggested),
  );
  const [comment, setComment] = useState(submission.adminOverrideComment ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await overrideModuleScore({
        submissionId: submission.id,
        studentId: submission.studentId,
        moduleId: submission.moduleId,
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

export function ModuleEvidenceList({
  submissions,
}: {
  submissions: ModuleSubmission[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {submissions.map((s) => (
        <Card key={s.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[16px]">{s.moduleTitle}</CardTitle>
                <CardDescription>
                  {s.studentName}
                  {s.categoryName ? ` · ${s.categoryName}` : ""}
                </CardDescription>
              </div>
              {s.aiEvaluation?.pending ? (
                <Badge variant="outline" className="gap-1.5">
                  <CircleAlert className="h-3.5 w-3.5" />
                  Sin evaluar (falta GEMINI_API_KEY)
                </Badge>
              ) : s.aiEvaluation ? (
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {s.aiEvaluation.percentage}% · IA
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {s.text}
            </p>
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
