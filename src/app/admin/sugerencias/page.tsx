import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { SuggestionList, type Suggestion } from "./suggestion-list";

export default async function SugerenciasPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent_admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("feedback_suggestions")
    .select(
      "id, message, status, admin_response, created_at, users:student_id ( display_name )",
    )
    .order("created_at", { ascending: false });

  const suggestions: Suggestion[] = (rows ?? []).map((r) => {
    const student = Array.isArray(r.users) ? r.users[0] : r.users;
    return {
      id: r.id,
      studentName: student?.display_name ?? "Alumno",
      message: r.message,
      status: r.status as Suggestion["status"],
      adminResponse: r.admin_response,
      createdAt: r.created_at,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Buzón de sugerencias
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Lo que te mandan tus hijos desde la app.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay ninguna sugerencia.
        </p>
      ) : (
        <SuggestionList suggestions={suggestions} />
      )}
    </div>
  );
}
