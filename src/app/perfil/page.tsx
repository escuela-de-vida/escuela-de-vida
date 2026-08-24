import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame, Sparkles, Download } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getPointsTotal, getStreak } from "@/lib/dashboard/queries";
import { getRank, getNextRank } from "@/lib/gamification/ranks";
import { createClient } from "@/lib/supabase/server";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PerfilPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect("/dashboard");

  const supabase = await createClient();
  const [points, streak, { data: awards }] = await Promise.all([
    getPointsTotal(profile.id),
    getStreak(profile.id),
    supabase
      .from("badge_awards")
      .select("awarded_at, badges ( name, description, icon )")
      .eq("student_id", profile.id)
      .order("awarded_at", { ascending: false }),
  ]);

  const rank = getRank(points);
  const nextRank = getNextRank(points);
  const progressToNext =
    nextRank && nextRank.min > rank.min
      ? ((points - rank.min) / (nextRank.min - rank.min)) * 100
      : 100;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="glass-panel sticky top-0 z-10 flex items-center gap-3 px-8 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-[17px] font-semibold tracking-tight">
          {profile.display_name}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-8 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[48px] leading-none">{rank.emoji}</span>
          <h1 className="text-[22px] font-semibold tracking-tight">
            {rank.name}
          </h1>
          {nextRank && (
            <div className="flex w-full max-w-xs flex-col gap-1.5">
              <Progress value={progressToNext} />
              <p className="text-[13px] text-muted-foreground">
                {nextRank.min - points} pts para {nextRank.name}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-1 py-4">
              <Flame className="h-5 w-5 text-[var(--category-creatividad)]" />
              <span className="text-[22px] font-semibold">{streak}</span>
              <span className="text-[13px] text-muted-foreground">
                días de racha
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 py-4">
              <Sparkles className="h-5 w-5 text-[var(--category-mente)]" />
              <span className="text-[22px] font-semibold">{points}</span>
              <span className="text-[13px] text-muted-foreground">
                puntos totales
              </span>
            </CardContent>
          </Card>
        </div>

        <a
          href={`/api/bitacora/${profile.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "gap-2 self-center")}
        >
          <Download className="h-4 w-4" />
          Descargar mi bitácora (PDF)
        </a>

        <div className="flex flex-col gap-3">
          <h2 className="text-[15px] font-medium text-muted-foreground">
            Insignias ({awards?.length ?? 0})
          </h2>
          {!awards || awards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no ganaste ninguna — van a ir apareciendo solas.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {awards.map((a, i) => {
                const badge = Array.isArray(a.badges) ? a.badges[0] : a.badges;
                if (!badge) return null;
                return (
                  <Card key={i}>
                    <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
                      <span className="text-[28px] leading-none">
                        {badge.icon}
                      </span>
                      <span className="text-[13px] font-medium">
                        {badge.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {badge.description}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
