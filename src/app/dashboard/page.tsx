import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass, Flame, Settings, Sparkles, GraduationCap, Trophy, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "./sign-out-button";
import { cn } from "@/lib/utils";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getPointsTotal, getStreak, getTaskInstancesForRange } from "@/lib/dashboard/queries";
import {
  addDays,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "@/lib/dates";
import { TimeframeTabs, type Timeframe } from "./timeframe-tabs";
import { DayView } from "./heatmap/day-view";
import { WeekView } from "./heatmap/week-view";
import { MonthView } from "./heatmap/month-view";
import { YearView } from "./heatmap/year-view";
import { MentorBanner } from "./mentor-banner";
import { getOrCreateDailyMessage } from "@/lib/mentor/daily-message";

function resolveRange(tf: Timeframe, today: Date) {
  switch (tf) {
    case "semana": {
      const start = startOfWeek(today);
      return { from: start, to: addDays(start, 6) };
    }
    case "mes":
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case "anio":
      return { from: startOfYear(today), to: endOfYear(today) };
    case "dia":
    default: {
      const day = startOfDay(today);
      return { from: day, to: day };
    }
  }
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const header = (
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
  );

  if (profile.role === "parent_admin") {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        {header}
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Familia
          </Badge>
          <h1 className="text-[28px] font-semibold tracking-tight">
            Hola, {profile.display_name}
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            El heatmap de esta sección es para los alumnos. Desde acá
            administrás categorías, tareas y libros.
          </p>
          <div className="mt-2 flex gap-2">
            <a href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Volver al inicio
            </a>
            <a
              href="/admin"
              className={cn(buttonVariants({ variant: "default" }), "gap-2")}
            >
              <Settings className="h-4 w-4" />
              Panel de admin
            </a>
          </div>
        </main>
      </div>
    );
  }

  const params = await searchParams;
  const tfParam = Array.isArray(params.tf) ? params.tf[0] : params.tf;
  const tf: Timeframe = (["dia", "semana", "mes", "anio"] as const).includes(
    tfParam as Timeframe,
  )
    ? (tfParam as Timeframe)
    : "dia";

  const today = new Date();
  const { from, to } = resolveRange(tf, today);

  const [instances, points, streak, mentorMessage] = await Promise.all([
    getTaskInstancesForRange(profile.id, from, to),
    getPointsTotal(profile.id),
    getStreak(profile.id),
    getOrCreateDailyMessage(profile.id, profile.family_id, profile.display_name),
  ]);

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
            Hola, {profile.display_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/materias"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-muted-foreground transition-spring duration-200 hover:bg-muted hover:text-foreground"
          >
            <GraduationCap className="h-4 w-4" />
            Materias
          </Link>
          <Link href="/perfil">
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-[var(--category-creatividad)]" />
              {streak} {streak === 1 ? "día" : "días"}
            </Badge>
          </Link>
          <Link href="/perfil">
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-[var(--category-mente)]" />
              {points} pts
            </Badge>
          </Link>
          <Link
            href="/ranking"
            aria-label="Ranking"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-spring duration-200 hover:bg-muted hover:text-foreground"
          >
            <Trophy className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/buzon"
            aria-label="Buzón de sugerencias"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-spring duration-200 hover:bg-muted hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-8 py-10">
        <MentorBanner
          id={mentorMessage.id}
          title={mentorMessage.title}
          body={mentorMessage.body}
          quote={mentorMessage.quote}
          initiallyRead={!!mentorMessage.read_at}
        />

        <TimeframeTabs active={tf} />

        {tf === "dia" && <DayView instances={instances} />}
        {tf === "semana" && (
          <WeekView weekStart={startOfWeek(today)} instances={instances} />
        )}
        {tf === "mes" && <MonthView month={today} instances={instances} />}
        {tf === "anio" && (
          <YearView year={today.getFullYear()} instances={instances} />
        )}
      </main>
    </div>
  );
}
