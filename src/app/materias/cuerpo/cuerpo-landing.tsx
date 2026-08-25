"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play, Camera, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExerciseIllustration } from "@/components/body/exercise-illustration";
import { DAY_TYPE_LABEL, SETS_PER_SESSION } from "@/lib/body/routine";
import type { BodyDashboardData } from "./queries";
import { GuidedWorkout } from "./guided-workout";
import { ProgressPhotoGuide } from "./progress-photo-guide";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABEL: Record<number, string> = {
  0: "D",
  1: "L",
  2: "M",
  3: "M",
  4: "J",
  5: "V",
  6: "S",
};

export function CuerpoLanding({
  data,
  categoryColor,
}: {
  data: BodyDashboardData;
  categoryColor: string;
}) {
  const router = useRouter();
  const [showWorkout, setShowWorkout] = useState(false);
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);

  const today = new Date().getDay();
  const dayTypeByWeekday = new Map(data.weeklySplit.map((d) => [d.weekday, d.dayType]));
  const doneSet = new Set(data.doneWeekdays);

  const isRestDay = !data.routine;
  const alreadyDone = data.todaysTaskStatus === "hecho";
  const canTrain = data.todaysTaskInstanceId && !alreadyDone && data.routine;

  function handleCompleted() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {!data.config.weightKg && !data.config.ageYears && (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Todavía no hay peso/edad configurados — la rutina de hoy usa valores
          por defecto. Pedile a un adulto que lo complete en{" "}
          <span className="font-medium">/admin/cuerpo</span>.
        </p>
      )}

      {/* Mapa semanal */}
      <Card>
        <CardContent className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-muted-foreground">
            Tu semana
          </span>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_ORDER.map((weekday) => {
              const dayType = dayTypeByWeekday.get(weekday);
              const isToday = weekday === today;
              const done = doneSet.has(weekday);
              return (
                <div
                  key={weekday}
                  className="flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3 text-center"
                  style={{
                    borderColor: isToday ? categoryColor : "var(--border)",
                    background: done ? `${categoryColor}18` : undefined,
                  }}
                >
                  <span className="text-[12px] font-medium">{WEEKDAY_LABEL[weekday]}</span>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: done ? categoryColor : dayType ? "var(--muted-foreground)" : "transparent",
                      opacity: done ? 1 : dayType ? 0.35 : 0,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rutina de hoy */}
      {isRestDay && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
            <p className="text-[15px] font-medium">Hoy es día de descanso</p>
            <p className="text-[13px] text-muted-foreground">
              El cuerpo también progresa cuando recupera.
            </p>
          </CardContent>
        </Card>
      )}

      {!isRestDay && data.routine && (
        <Card style={{ borderLeft: `4px solid ${categoryColor}` }}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-3 py-1 text-[13px] font-medium"
                style={{ background: `${categoryColor}22`, color: categoryColor }}
              >
                {DAY_TYPE_LABEL[data.routine.dayType]}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {SETS_PER_SESSION} series
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.routine.blocks.map((b) => (
                <div
                  key={b.exercise.id}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border p-3 text-center"
                >
                  <div className="h-12 w-12 text-foreground">
                    <ExerciseIllustration exercise={b.exercise} />
                  </div>
                  <span className="text-[12px] font-medium leading-tight">{b.exercise.name}</span>
                </div>
              ))}
            </div>

            {alreadyDone ? (
              <p className="text-center text-[14px] text-muted-foreground">
                Ya completaste la rutina de hoy. ✓
              </p>
            ) : (
              <Button
                size="lg"
                className="gap-2"
                disabled={!canTrain}
                onClick={() => setShowWorkout(true)}
              >
                <Play className="h-4 w-4" />
                Comenzar rutina guiada
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fotos de progreso */}
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">
              Fotos de progreso
            </span>
            {data.todaysTaskInstanceId && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowPhotoGuide(true)}
              >
                <Camera className="h-3.5 w-3.5" />
                Agregar
              </Button>
            )}
          </div>
          {data.progressPhotos.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              Todavía no hay fotos. La primera es el punto de partida.
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.progressPhotos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.url}
                  alt="Foto de progreso"
                  className="h-28 w-20 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de reflexiones */}
      {data.recentSessions.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <span className="text-[13px] font-medium text-muted-foreground">
              Últimas rutinas
            </span>
            <div className="flex flex-col gap-2">
              {data.recentSessions.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium">
                      {DAY_TYPE_LABEL[s.day_type as keyof typeof DAY_TYPE_LABEL] ?? s.day_type}
                    </span>
                    {s.felt && (
                      <span className="text-[12px] text-muted-foreground">&ldquo;{s.felt}&rdquo;</span>
                    )}
                  </div>
                  <span className="shrink-0 text-[12px] text-muted-foreground">
                    +{s.points_awarded} pts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showWorkout && data.routine && data.todaysTaskInstanceId && (
        <GuidedWorkout
          taskInstanceId={data.todaysTaskInstanceId}
          dayType={data.routine.dayType}
          blocks={data.routine.blocks}
          categoryColor={categoryColor}
          onClose={() => setShowWorkout(false)}
          onCompleted={handleCompleted}
          onRequestPhoto={() => {
            setShowWorkout(false);
            setShowPhotoGuide(true);
          }}
        />
      )}

      {showPhotoGuide && data.todaysTaskInstanceId && (
        <ProgressPhotoGuide
          taskInstanceId={data.todaysTaskInstanceId}
          onClose={() => setShowPhotoGuide(false)}
          onUploaded={() => router.refresh()}
        />
      )}
    </div>
  );
}
