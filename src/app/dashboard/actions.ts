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
import { computeTypingMetrics } from "@/lib/typing/metrics";
import { quoteOfTheDay } from "@/lib/mentor/quotes";
import { startOfDay } from "@/lib/dates";

const QUOTE_REWRITE_POINTS = 3;
const QUOTE_REWRITE_REASON = "Reescritura de la frase del día";

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

/**
 * Cierra la tarea del heatmap "Mecanografía y dictado" con el dictado real
 * (en vez del batch de foco genérico) — une la lógica de puntualidad del
 * motor de tareas con el bonus por WPM/precisión sobre el propio promedio
 * (sección 7.4), en una sola entrada de points_ledger.
 */
export async function completeTypingTask(
  taskInstanceId: string,
  dictationText: string,
  typedText: string,
  durationSeconds: number,
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    throw new Error("No autorizado");
  }

  const supabase = await createClient();

  const { data: instance, error: fetchError } = await supabase
    .from("task_instances")
    .select("id, scheduled_date, status, task_templates ( points_base )")
    .eq("id", taskInstanceId)
    .eq("student_id", profile.id)
    .single();

  if (fetchError || !instance) throw new Error("Tarea no encontrada");
  if (instance.status !== "pendiente") {
    throw new Error("Esta tarea ya no está pendiente");
  }

  const template = Array.isArray(instance.task_templates)
    ? instance.task_templates[0]
    : instance.task_templates;
  const pointsBase = template?.points_base ?? 5;

  const originalDate = await findOriginalScheduledDate(
    supabase,
    instance.id,
    instance.scheduled_date,
  );
  const todayISO = toISODate(new Date());
  const daysLate = daysBetween(originalDate, todayISO);
  const basePoints = pointsForDaysLate(pointsBase, daysLate);

  const { wpm, accuracyPct, errors } = computeTypingMetrics(
    dictationText,
    typedText,
    durationSeconds,
  );

  const { data: recent } = await supabase
    .from("typing_sessions")
    .select("wpm, accuracy_pct")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentAvgWpm = recent?.length
    ? recent.reduce((sum, r) => sum + r.wpm, 0) / recent.length
    : null;
  const recentAvgAccuracy = recent?.length
    ? recent.reduce((sum, r) => sum + r.accuracy_pct, 0) / recent.length
    : null;

  let bonus = 0;
  if (recentAvgWpm !== null && wpm > recentAvgWpm) bonus += 3;
  if (recentAvgAccuracy !== null && accuracyPct > recentAvgAccuracy) bonus += 2;

  const points = basePoints + bonus;

  const { error: sessionError } = await supabase.from("typing_sessions").insert({
    family_id: profile.family_id,
    student_id: profile.id,
    dictation_text: dictationText,
    typed_text: typedText,
    wpm,
    accuracy_pct: accuracyPct,
    errors,
    duration_seconds: Math.round(durationSeconds),
    points_awarded: points,
  });
  if (sessionError) throw new Error(sessionError.message);

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
    const admin = createAdminClient();
    const { error: ledgerError } = await admin.from("points_ledger").insert({
      family_id: profile.family_id,
      student_id: profile.id,
      source_type: "task",
      source_id: instance.id,
      points,
      reason: `Dictado: ${wpm} PPM, ${accuracyPct}% de precisión`,
    });
    if (ledgerError) throw new Error(ledgerError.message);
  }

  await checkAndAwardBadges(profile.id, profile.family_id);

  revalidatePath("/dashboard");
  return { points, wpm, accuracyPct };
}

/**
 * Reescribir la frase del día — ejercicio chico para ayudar a incorporarla
 * (pedido de ajustes). Nunca penaliza un intento imperfecto: si no llega al
 * umbral, simplemente no se acreditan puntos todavía y puede reintentar.
 */
export async function submitQuoteRewrite(typedText: string) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") throw new Error("No autorizado");

  const today = startOfDay(new Date());
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("points_ledger")
    .select("id")
    .eq("student_id", profile.id)
    .eq("source_type", "task")
    .eq("reason", QUOTE_REWRITE_REASON)
    .gte("created_at", today.toISOString())
    .maybeSingle();

  if (existing) throw new Error("Ya reescribiste la frase de hoy.");

  const quote = quoteOfTheDay(today);
  const { accuracyPct } = computeTypingMetrics(quote, typedText.trim(), 1);

  if (accuracyPct < 85) {
    return { success: false, accuracyPct, points: 0 };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("points_ledger").insert({
    family_id: profile.family_id,
    student_id: profile.id,
    source_type: "task",
    points: QUOTE_REWRITE_POINTS,
    reason: QUOTE_REWRITE_REASON,
  });
  if (error) throw new Error(error.message);

  await checkAndAwardBadges(profile.id, profile.family_id);

  revalidatePath("/dashboard");
  return { success: true, accuracyPct, points: QUOTE_REWRITE_POINTS };
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
