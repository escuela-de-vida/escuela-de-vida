"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendSuggestion } from "./actions";

export function SuggestionForm() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await sendSuggestion(message);
      setMessage("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="¿Algo que quieras contarnos, pedirnos o sugerirnos?"
        className="min-h-28"
        required
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving} className="gap-1.5">
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Enviar
        </Button>
        {sent && (
          <span className="text-[13px] text-muted-foreground">
            ¡Enviado! Ya te va a llegar una respuesta.
          </span>
        )}
      </div>
    </form>
  );
}
