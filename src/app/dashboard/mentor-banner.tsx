"use client";

import { useState } from "react";
import { Compass, X } from "lucide-react";
import { markNotificationRead } from "./actions";

export function MentorBanner({
  id,
  title,
  body,
  initiallyRead,
}: {
  id: string;
  title: string;
  body: string;
  initiallyRead: boolean;
}) {
  const [dismissed, setDismissed] = useState(initiallyRead);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    markNotificationRead(id);
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/50 px-5 py-4">
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
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Cerrar"
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
