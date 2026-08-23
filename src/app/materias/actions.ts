"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/current-user";
import type { ModuleContent } from "@/lib/curriculum/types";
import { checkAndAwardBadges } from "@/lib/gamification/badges";

export async function completeModule(
  moduleId: string,
  input: { text?: string; quizAnswers?: number[] },
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    throw new Error("No autorizado");
  }

  const supabase = await createClient();

  const { data: module, error: moduleError } = await supabase
    .from("subject_modules")
    .select("id, points, content")
    .eq("id", moduleId)
    .single();

  if (moduleError || !module) throw new Error("Módulo no encontrado");

  const { data: alreadyDone } = await supabase
    .from("student_module_progress")
    .select("id")
    .eq("module_id", moduleId)
    .eq("student_id", profile.id)
    .eq("status", "completado")
    .maybeSingle();

  if (alreadyDone) throw new Error("Este módulo ya está completado");

  const content = module.content as unknown as ModuleContent;
  let points = module.points;

  if (content.kind === "quiz" && content.quiz) {
    const answers = input.quizAnswers ?? [];
    const correct = content.quiz.filter(
      (q, i) => answers[i] === q.correctIndex,
    ).length;
    points = Math.round((module.points * correct) / content.quiz.length);
  }

  const { data: progressRow, error: progressError } = await supabase
    .from("student_module_progress")
    .upsert(
      {
        family_id: profile.family_id,
        student_id: profile.id,
        module_id: moduleId,
        status: "completado",
        completed_at: new Date().toISOString(),
        points_awarded: points,
      },
      { onConflict: "student_id,module_id" },
    )
    .select("id")
    .single();

  if (progressError) throw new Error(progressError.message);

  if (input.text?.trim()) {
    await supabase.from("submissions").insert({
      family_id: profile.family_id,
      student_id: profile.id,
      type: "texto",
      text_content: input.text.trim(),
      task_instance_id: null,
      metadata: { subject_module_id: moduleId },
    });
  }

  if (points > 0) {
    // Mismo patrón que el motor de tareas (Fase 3): points_ledger es
    // insert-only-admin por RLS, el gate real ya pasó arriba.
    const admin = createAdminClient();
    const { error: ledgerError } = await admin.from("points_ledger").insert({
      family_id: profile.family_id,
      student_id: profile.id,
      source_type: "module",
      source_id: progressRow?.id ?? moduleId,
      points,
      reason: "Módulo de materia completado",
    });
    if (ledgerError) throw new Error(ledgerError.message);
  }

  await checkAndAwardBadges(profile.id, profile.family_id);

  revalidatePath("/materias");
  return { points };
}
