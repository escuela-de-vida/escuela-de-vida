"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { checkAndAwardBadges } from "@/lib/gamification/badges";
import { computeTypingMetrics } from "@/lib/typing/metrics";

const BASE_POINTS = 5;

export async function submitTypingSession(params: {
  dictationText: string;
  typedText: string;
  durationSeconds: number;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") throw new Error("No autorizado");

  const { wpm, accuracyPct, errors } = computeTypingMetrics(
    params.dictationText,
    params.typedText,
    params.durationSeconds,
  );

  const supabase = await createClient();
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

  let points = BASE_POINTS;
  if (recentAvgWpm !== null && wpm > recentAvgWpm) points += 3;
  if (recentAvgAccuracy !== null && accuracyPct > recentAvgAccuracy) points += 2;

  const { error: insertError } = await supabase.from("typing_sessions").insert({
    family_id: profile.family_id,
    student_id: profile.id,
    dictation_text: params.dictationText,
    typed_text: params.typedText,
    wpm,
    accuracy_pct: accuracyPct,
    errors,
    duration_seconds: Math.round(params.durationSeconds),
    points_awarded: points,
  });
  if (insertError) throw new Error(insertError.message);

  const admin = createAdminClient();
  const { error: ledgerError } = await admin.from("points_ledger").insert({
    family_id: profile.family_id,
    student_id: profile.id,
    source_type: "task",
    points,
    reason: `Mecanografía: ${wpm} PPM, ${accuracyPct}% de precisión`,
  });
  if (ledgerError) throw new Error(ledgerError.message);

  await checkAndAwardBadges(profile.id, profile.family_id);

  revalidatePath("/materias/comunicacion");
  return { wpm, accuracyPct, points, errorCount: errors.length };
}
