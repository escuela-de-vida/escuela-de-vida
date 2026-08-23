import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "./sign-out-button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
        <a
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-2")}
        >
          Volver al inicio
        </a>
      </main>
    </div>
  );
}
