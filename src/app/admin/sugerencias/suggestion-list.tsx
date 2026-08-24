"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markSuggestionSeen, replySuggestion } from "./actions";

export type Suggestion = {
  id: string;
  studentName: string;
  message: string;
  status: "nuevo" | "visto" | "respondido";
  adminResponse: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<Suggestion["status"], string> = {
  nuevo: "Nuevo",
  visto: "Visto",
  respondido: "Respondido",
};

function ReplyForm({
  suggestion,
  onReplied,
}: {
  suggestion: Suggestion;
  onReplied: () => void;
}) {
  const [response, setResponse] = useState(suggestion.adminResponse ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleReply() {
    setSaving(true);
    try {
      await replySuggestion(suggestion.id, response);
      setSaved(true);
      onReplied();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Escribí una respuesta..."
        className="min-h-16"
      />
      <div>
        <Button size="sm" onClick={handleReply} disabled={saving} className="gap-1.5">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saved ? "Guardado" : "Responder"}
        </Button>
      </div>
    </div>
  );
}

export function SuggestionList({ suggestions }: { suggestions: Suggestion[] }) {
  return (
    <div className="flex flex-col gap-4">
      {suggestions.map((s) => (
        <SuggestionCard key={s.id} suggestion={s} />
      ))}
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const [status, setStatus] = useState(suggestion.status);

  function handleView() {
    if (status !== "nuevo") return;
    setStatus("visto");
    markSuggestionSeen(suggestion.id);
  }

  return (
    <Card onMouseEnter={handleView}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px]">{suggestion.studentName}</CardTitle>
            <CardDescription>
              {new Date(suggestion.createdAt).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
              })}
            </CardDescription>
          </div>
          <Badge variant={status === "respondido" ? "secondary" : "outline"}>
            {STATUS_LABEL[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-[14px]">{suggestion.message}</p>
        <ReplyForm
          suggestion={suggestion}
          onReplied={() => setStatus("respondido")}
        />
      </CardContent>
    </Card>
  );
}
