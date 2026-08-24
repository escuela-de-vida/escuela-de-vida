import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "evidence";

/**
 * Sube una foto de evidencia al bucket privado. Camino
 * {family_id}/{student_id}/{timestamp}-{random}.{ext} — nunca público,
 * solo accesible generando una URL firmada server-side (sección 8:
 * mismo criterio que el bucket de Public Speaking, aplicado acá a fotos).
 */
export async function uploadEvidencePhoto(params: {
  familyId: string;
  studentId: string;
  base64Data: string;
  mimeType: string;
}): Promise<string> {
  const admin = createAdminClient();
  const ext = params.mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `${params.familyId}/${params.studentId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(params.base64Data, "base64");
  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: params.mimeType,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return path;
}

/** URL firmada de corta duración — nunca un link permanente. */
export async function getEvidenceSignedUrl(
  path: string,
  expiresInSeconds = 300,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}
