"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { findOriginalScheduledDate } from "@/lib/task-engine/chain";
import { daysBetween, pointsForDaysLate } from "@/lib/task-engine/points";
import { toISODate } from "@/lib/dates";
import { checkAndAwardBadges } from "@/lib/gamification/badges";
import { uploadEvidencePhoto } from "@/lib/storage/evidence";
import { evaluateTaskPhoto } from "@/lib/ai/evaluate-photo";

export async function markTaskDone(
  taskInstanceId: string,
  evidenceText?: string,
  evidencePhoto?: { base64Data: string; mimeType: string },
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    throw new Error("No autorizado");
  }

  const supabase = await createClient();

  const { data: instance, error: fetchError } = await supabase
    .from("task_instances")
    .select(
      "id, scheduled_date, status, student_id, template_id, task_templates ( title, description, points_base )",
    )
    .eq("id", taskInstanceId)
    .eq("student_id", profile.id)
    .single();

  if (fetchError || !instance) {
    throw new Error("Tarea no encontrada");
  }
  if (instance.status !== "pendiente") {
    throw new Error("Esta tarea ya no está pendiente");
  }

  const template = Array.isArray(instance.task_templates)
    ? instance.task_templates[0]
    : instance.task_templates;
  const pointsBase = template?.points_base ?? 0;

  const originalDate = await findOriginalScheduledDate(
    supabase,
    instance.id,
    instance.scheduled_date,
  );
  const todayISO = toISODate(new Date());
  const daysLate = daysBetween(originalDate, todayISO);
  const points = pointsForDaysLate(pointsBase, daysLate);

  const { error: updateError } = await supabase
    .from("task_instances")
    .update({
      status: "hecho",
      completed_at: new Date().toISOString(),
      points_awarded: points,
    })
    .eq("id", instance.id);

  if (updateError) throw new Error(updateError.message);

  if (points > 0) {
    // points_ledger es de solo-escritura-admin por RLS (es un histórico
    // inmutable) — el gate de seguridad real ya pasó arriba (verificamos
    // que la instancia es 'pendiente' y pertenece a este alumno), así que
    // acá usamos el cliente admin para asentar el punto ya calculado.
    const admin = createAdminClient();
    const { error: ledgerError } = await admin.from("points_ledger").insert({
      family_id: profile.family_id,
      student_id: profile.id,
      source_type: "task",
      source_id: instance.id,
      points,
      reason:
        daysLate <= 0
          ? "Tarea completada a tiempo"
          : "Tarea completada dentro de la ventana de gracia",
    });
    if (ledgerError) throw new Error(ledgerError.message);
  }

  if (evidenceText?.trim()) {
    await supabase.from("submissions").insert({
      family_id: profile.family_id,
      task_instance_id: instance.id,
      student_id: profile.id,
      type: "texto",
      text_content: evidenceText.trim(),
    });
  }

  let photoFeedback: string | null = null;

  if (evidencePhoto) {
    const path = await uploadEvidencePhoto({
      familyId: profile.family_id,
      studentId: profile.id,
      base64Data: evidencePhoto.base64Data,
      mimeType: evidencePhoto.mimeType,
    });
    const evaluation = await evaluateTaskPhoto({
      taskTitle: template?.title ?? "Tarea",
      taskDescription: template?.description ?? null,
      imageBase64: evidencePhoto.base64Data,
      imageMimeType: evidencePhoto.mimeType,
    });
    await supabase.from("submissions").insert({
      family_id: profile.family_id,
      task_instance_id: instance.id,
      student_id: profile.id,
      type: "foto",
      file_url: path,
      ai_evaluation: evaluation
        ? { ...evaluation, pending: false }
        : { pending: true },
      ai_evaluated_at: evaluation ? new Date().toISOString() : null,
    });
    photoFeedback = evaluation?.feedback ?? null;
  }

  await checkAndAwardBadges(profile.id, profile.family_id);

  revalidatePath("/dashboard");
  return { points, photoFeedback };
}

export async function markNotificationRead(notificationId: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("No autorizado");
  if (notificationId.startsWith("local-")) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", profile.id);

  revalidatePath("/dashboard");
}
