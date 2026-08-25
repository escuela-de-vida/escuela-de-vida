"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadBodyProgressPhoto } from "./actions";

/** Silueta de referencia — mismo criterio de pose para cada foto, para que el
 * compounding del progreso se vea real (sección de fotos de evidencia). */
function PoseGuideSilhouette() {
  return (
    <svg viewBox="0 0 120 220" className="h-40 w-auto text-muted-foreground/50" aria-hidden>
      <circle cx="60" cy="28" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
      <line x1="60" y1="46" x2="60" y2="130" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
      <line x1="60" y1="65" x2="25" y2="110" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
      <line x1="60" y1="65" x2="95" y2="110" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
      <line x1="60" y1="130" x2="35" y2="205" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
      <line x1="60" y1="130" x2="85" y2="205" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
    </svg>
  );
}

export function ProgressPhotoGuide({
  taskInstanceId,
  onClose,
  onUploaded,
}: {
  taskInstanceId: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!preview) return;
    setUploading(true);
    try {
      const [header, base64Data] = preview.split(",");
      const mimeType = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
      await uploadBodyProgressPhoto(taskInstanceId, { base64Data, mimeType });
      onUploaded();
      onClose();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 px-6 backdrop-blur-xl">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full p-2 text-muted-foreground hover:bg-muted"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      <h2 className="text-[20px] font-semibold tracking-tight">Foto de progreso</h2>

      {!preview && (
        <>
          <PoseGuideSilhouette />
          <p className="max-w-xs text-center text-[13px] text-muted-foreground">
            Parate de perfil, a la misma distancia y en el mismo lugar que la
            última vez, con buena luz — así se nota el progreso real con el
            tiempo.
          </p>
          <Button onClick={() => fileRef.current?.click()} className="gap-2">
            <Camera className="h-4 w-4" />
            Tomar foto
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}

      {preview && (
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Vista previa" className="h-64 w-auto rounded-2xl object-cover" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPreview(null)} disabled={uploading}>
              Repetir
            </Button>
            <Button onClick={handleSave} disabled={uploading} className="gap-2">
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
