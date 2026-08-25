import { createClient } from "@/lib/supabase/server";
import { Dumbbell } from "lucide-react";
import { BodyConfigCard } from "./body-config-card";

export default async function AdminCuerpoPage() {
  const supabase = await createClient();

  const [{ data: students }, { data: configs }] = await Promise.all([
    supabase
      .from("users")
      .select("id, display_name")
      .eq("role", "student")
      .eq("is_fictional", false)
      .order("display_name", { ascending: true }),
    supabase
      .from("student_body_config")
      .select("student_id, weight_kg, age_years, days_per_week"),
  ]);

  const configByStudent = new Map(
    (configs ?? []).map((c) => [c.student_id, c]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--category-cuerpo)" }}
        >
          <Dumbbell className="h-5 w-5 text-white" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Cuerpo</h1>
          <p className="text-[13px] text-muted-foreground">
            Configurá peso, edad y días de calistenia por semana — el sistema
            arma la rutina de cada día solo.
          </p>
        </div>
      </div>

      {(students ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay alumnos.</p>
      )}

      <div className="flex flex-col gap-4">
        {(students ?? []).map((student) => (
          <BodyConfigCard
            key={student.id}
            studentId={student.id}
            studentName={student.display_name}
            config={configByStudent.get(student.id) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
