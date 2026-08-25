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
import { SETS_PER_SESSION, type DayType } from "@/lib/body/routine";

const REFLECTION_BONUS = 3;

export type CompletedExerciseLog = {
  exerciseId: string;
  name: string;
  muscleGroup: string;
};

/**
 * Cierra la tarea de "Cuerpo" del heatmap con el detalle real de la rutina
 * guiada (en vez del batch de foco genérico) — mismo criterio de puntualidad
 * del motor de tareas que markTaskDone, más el bonus por completar la capa
 * de conciencia post-ejercicio (cómo se sintió, honestidad en las series).
 * Si salió antes de las 3 rondas, los puntos base se prorratean por rondas
 * completadas — "lo que no se hace no suma", nunca todo o nada.
 */
export async function completeBodyWorkout(
  taskInstanceId: string,
  input: {
    dayType: DayType;
    exercises: CompletedExerciseLog[];
    roundsCompleted: number;
    felt: string;
    honestEffort: boolean;
    notes?: string;
  },
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") throw new Error("No autorizado");
  if (input.roundsCompleted < 1) throw new Error("Completá al menos una serie");

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
  const templatePoints = template?.points_base ?? 15;

  const originalDate = await findOriginalScheduledDate(
    supabase,
    instance.id,
    instance.scheduled_date,
  );
  const todayISO = toISODate(new Date());
  const daysLate = daysBetween(originalDate, todayISO);

  const roundsFraction = Math.min(input.roundsCompleted, SETS_PER_SESSION) / SETS_PER_SESSION;
  const basePoints = Math.round(
    pointsForDaysLate(templatePoints, daysLate) * roundsFraction,
  );
  const reflectionBonus = input.felt.trim().length > 0 ? REFLECTION_BONUS : 0;
  const points = basePoints + reflectionBonus;

  const { error: updateError } = await supabase
    .from("task_instances")
    .update({
      status: "hecho",
      completed_at: new Date().toISOString(),
      points_awarded: points,
    })
    .eq("id", instance.id);
  if (updateError) throw new Error(updateError.message);

  const { error: sessionError } = await supabase.from("body_workout_sessions").insert({
    family_id: profile.family_id,
    task_instance_id: instance.id,
    student_id: profile.id,
    day_type: input.dayType,
    exercises: input.exercises,
    rounds_completed: input.roundsCompleted,
    felt: input.felt.trim() || null,
    honest_effort: input.honestEffort,
    notes: input.notes?.trim() || null,
    points_awarded: points,
  });
  if (sessionError) throw new Error(sessionError.message);

  if (points > 0) {
    const admin = createAdminClient();
    const { error: ledgerError } = await admin.from("points_ledger").insert({
      family_id: profile.family_id,
      student_id: profile.id,
      source_type: "task",
      source_id: instance.id,
      points,
      reason:
        reflectionBonus > 0
          ? "Rutina de calistenia completada + reflexión"
          : "Rutina de calistenia completada",
    });
    if (ledgerError) throw new Error(ledgerError.message);
  }

  await checkAndAwardBadges(profile.id, profile.family_id);

  revalidatePath("/dashboard");
  revalidatePath("/materias/cuerpo");
  return { points };
}

/**
 * Foto de progreso corporal — no evalúa "genuinidad" como la evidencia de
 * tarea (no tiene sentido acá) ni suma puntos aparte; el objetivo es
 * únicamente ver el compounding a lo largo del tiempo en la galería.
 */
export async function uploadBodyProgressPhoto(
  taskInstanceId: string,
  photo: { base64Data: string; mimeType: string },
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") throw new Error("No autorizado");

  const supabase = await createClient();
  const { data: instance } = await supabase
    .from("task_instances")
    .select("id")
    .eq("id", taskInstanceId)
    .eq("student_id", profile.id)
    .single();
  if (!instance) throw new Error("Tarea no encontrada");

  const path = await uploadEvidencePhoto({
    familyId: profile.family_id,
    studentId: profile.id,
    base64Data: photo.base64Data,
    mimeType: photo.mimeType,
  });

  const { error } = await supabase.from("submissions").insert({
    family_id: profile.family_id,
    task_instance_id: instance.id,
    student_id: profile.id,
    type: "foto",
    file_url: path,
    metadata: { kind: "progreso_cuerpo" },
  });
  if (error) throw new Error(error.message);

  revalidatePath("/materias/cuerpo");
}
