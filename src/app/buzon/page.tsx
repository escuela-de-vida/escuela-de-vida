import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SuggestionForm } from "./suggestion-form";

export default async function BuzonPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const { data: suggestions } = await supabase
    .from("feedback_suggestions")
    .select("id, message, status, admin_response, created_at")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="glass-panel sticky top-0 z-10 flex items-center gap-3 px-8 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--category-comunidad)]">
          <Mail className="h-5 w-5 text-white" strokeWidth={1.75} />
        </div>
        <span className="text-[17px] font-semibold tracking-tight">
          Buzón de sugerencias
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-8 py-10">
        <SuggestionForm />

        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[15px] font-medium text-muted-foreground">
              Lo que mandaste antes
            </h2>
            {suggestions.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex flex-col gap-2 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px]">{s.message}</p>
                    {s.status === "respondido" && (
                      <Badge variant="secondary" className="shrink-0 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Respondido
                      </Badge>
                    )}
                  </div>
                  {s.admin_response && (
                    <p className="rounded-lg bg-muted p-3 text-[13px] text-muted-foreground">
                      {s.admin_response}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
