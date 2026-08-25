"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/current-user";

export type BodyConfigInput = {
  studentId: string;
  weightKg: number | null;
  ageYears: number | null;
  daysPerWeek: number;
};

async function requireAdminFamily() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "parent_admin") {
    throw new Error("No autorizado");
  }
  return profile;
}

export async function upsertStudentBodyConfig(input: BodyConfigInput) {
  const profile = await requireAdminFamily();
  const supabase = await createClient();

  const { error } = await supabase.from("student_body_config").upsert(
    {
      family_id: profile.family_id,
      student_id: input.studentId,
      weight_kg: input.weightKg,
      age_years: input.ageYears,
      days_per_week: input.daysPerWeek,
    },
    { onConflict: "student_id" },
  );

  if (error) throw new Error(error.message);
  revalidatePath("/admin/cuerpo");
}
