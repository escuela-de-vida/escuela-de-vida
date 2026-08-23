import { redirect } from "next/navigation";
import { Compass, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "./sign-out-button";
import { cn } from "@/lib/utils";
import { getCurrentProfile } from "@/lib/auth/current-user";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="glass-panel sticky top-0 z-10 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "var(--category-conocimiento)" }}
          >
            <Compass className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-[17px] font-semibold tracking-tight">
            Escuela de Vida
          </span>
        </div>
        <SignOutButton />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          Fase 0 · Login funcional
        </Badge>
        <h1 className="text-[28px] font-semibold tracking-tight">
          Sesión iniciada como {user.email}
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
          El heatmap, el motor de tareas y el resto del dashboard llegan en
          las próximas fases del roadmap.
        </p>
        <div className="mt-2 flex gap-2">
          <a href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Volver al inicio
          </a>
          {profile?.role === "parent_admin" && (
            <a
              href="/admin"
              className={cn(buttonVariants({ variant: "default" }), "gap-2")}
            >
              <Settings className="h-4 w-4" />
              Panel de admin
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
