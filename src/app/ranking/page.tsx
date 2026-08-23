import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getLeaderboard } from "@/lib/gamification/leaderboard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function RankingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const rows = await getLeaderboard(
    profile.family_id,
    profile.role === "student" ? profile.id : null,
  );
  const isAdmin = profile.role === "parent_admin";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="glass-panel sticky top-0 z-10 flex items-center gap-3 px-8 py-4">
        <Link
          href={profile.role === "student" ? "/dashboard" : "/admin"}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--category-creatividad)]">
          <Trophy className="h-5 w-5 text-white" strokeWidth={1.75} />
        </div>
        <span className="text-[17px] font-semibold tracking-tight">
          Ranking
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-2 px-8 py-10">
        {rows.map((row, i) => (
          <div
            key={`${row.displayName}-${i}`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5",
              row.isSelf && "bg-primary/10 ring-1 ring-primary/30",
            )}
          >
            <span className="w-6 text-center text-[13px] text-muted-foreground">
              {i + 1}
            </span>
            <span className="flex-1 text-[15px]">
              {row.displayName}
              {row.isSelf && (
                <span className="ml-1.5 text-[13px] text-muted-foreground">
                  (vos)
                </span>
              )}
            </span>
            {isAdmin && row.isFictional && (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                ficticio
              </Badge>
            )}
            <span className="text-[15px] font-medium tabular-nums">
              {row.points} pts
            </span>
          </div>
        ))}
      </main>
    </div>
  );
}
