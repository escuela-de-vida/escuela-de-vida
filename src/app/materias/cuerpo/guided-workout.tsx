"use client";

import { useEffect, useRef, useState } from "react";
import { X, Play, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExerciseIllustration } from "@/components/body/exercise-illustration";
import { DAY_TYPE_LABEL, SETS_PER_SESSION, type DayType, type RoutineBlock } from "@/lib/body/routine";
import { completeBodyWorkout } from "./actions";
import {
  playCountInTick,
  playTransitionSound,
  playBellSound,
  playSuccessSound,
} from "@/lib/feedback/sound";
import { fireConfetti } from "@/lib/feedback/confetti";

const WORK_SECONDS_REPS = 40;
const REST_EXERCISE_SECONDS = 15;
const ROUND_REST_SECONDS = 120;
const COUNT_IN_SECONDS = 3;

type Phase = "preview" | "countin" | "work" | "rest-exercise" | "round-rest" | "reflection" | "done";

function CountdownRing({
  secondsLeft,
  totalSeconds,
  size = 220,
  color,
  children,
}: {
  secondsLeft: number;
  totalSeconds: number;
  size?: number;
  color: string;
  children: React.ReactNode;
}) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const fraction = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function GuidedWorkout({
  taskInstanceId,
  dayType,
  blocks,
  categoryColor,
  onClose,
  onCompleted,
  onRequestPhoto,
}: {
  taskInstanceId: string;
  dayType: DayType;
  blocks: RoutineBlock[];
  categoryColor: string;
  onClose: () => void;
  onCompleted: () => void;
  onRequestPhoto: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("preview");
  const [roundIndex, setRoundIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [saving, setSaving] = useState(false);
  const [points, setPoints] = useState<number | null>(null);

  const [felt, setFelt] = useState("");
  const [honestEffort, setHonestEffort] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");

  const block = blocks[exerciseIndex];
  const workSeconds = block.exercise.mode === "hold" ? block.exercise.target : WORK_SECONDS_REPS;

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (phase === "preview" || phase === "reflection" || phase === "done") return;
    if (secondsLeft <= 0) return;

    const id = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next <= 3 && next > 0 && (phaseRef.current === "round-rest" || phaseRef.current === "countin")) {
          playCountInTick();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, secondsLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (secondsLeft > 0) return;

    if (phase === "countin") {
      setPhase("work");
      setSecondsLeft(workSeconds);
    } else if (phase === "work") {
      playTransitionSound();
      const isLastExercise = exerciseIndex === blocks.length - 1;
      if (!isLastExercise) {
        setPhase("rest-exercise");
        setSecondsLeft(REST_EXERCISE_SECONDS);
      } else {
        const finishedRound = roundIndex + 1;
        setRoundsCompleted(finishedRound);
        if (finishedRound >= SETS_PER_SESSION) {
          playBellSound();
          setPhase("reflection");
        } else {
          playBellSound();
          setPhase("round-rest");
          setSecondsLeft(ROUND_REST_SECONDS);
        }
      }
    } else if (phase === "rest-exercise") {
      const nextExercise = blocks[exerciseIndex + 1].exercise;
      setExerciseIndex((i) => i + 1);
      setPhase("work");
      setSecondsLeft(nextExercise.mode === "hold" ? nextExercise.target : WORK_SECONDS_REPS);
    } else if (phase === "round-rest") {
      const firstExercise = blocks[0].exercise;
      setRoundIndex((r) => r + 1);
      setExerciseIndex(0);
      setPhase("work");
      setSecondsLeft(firstExercise.mode === "hold" ? firstExercise.target : WORK_SECONDS_REPS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  function handleStart() {
    setPhase("countin");
    setSecondsLeft(COUNT_IN_SECONDS);
  }

  function handleFinishEarly() {
    setPhase("reflection");
  }

  async function handleSubmitReflection() {
    setSaving(true);
    try {
      const result = await completeBodyWorkout(taskInstanceId, {
        dayType,
        exercises: blocks.map((b) => ({
          exerciseId: b.exercise.id,
          name: b.exercise.name,
          muscleGroup: b.exercise.muscleGroup,
        })),
        roundsCompleted,
        felt,
        honestEffort: honestEffort ?? true,
        notes,
      });
      setPoints(result.points);
      setPhase("done");
      fireConfetti(categoryColor);
      playSuccessSound();
      onCompleted();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full p-2 text-muted-foreground hover:bg-muted"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      {phase === "preview" && (
        <div className="flex w-full max-w-lg flex-col items-center gap-6 px-6">
          <span
            className="rounded-full px-3 py-1 text-[13px] font-medium"
            style={{ background: `${categoryColor}22`, color: categoryColor }}
          >
            {DAY_TYPE_LABEL[dayType]}
          </span>
          <h2 className="text-center text-[24px] font-semibold tracking-tight">
            {SETS_PER_SESSION} series de hoy
          </h2>
          <div className="flex w-full flex-col gap-3">
            {blocks.map((b) => (
              <div
                key={b.exercise.id}
                className="flex items-center gap-3 rounded-2xl border border-border p-3"
              >
                <div className="h-14 w-14 shrink-0 text-foreground">
                  <ExerciseIllustration exercise={b.exercise} />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-[15px] font-medium">{b.exercise.name}</span>
                  <span className="text-[12px] text-muted-foreground">
                    {b.exercise.musclesWorked}
                  </span>
                </div>
                <span className="text-[13px] text-muted-foreground">
                  {b.exercise.mode === "hold"
                    ? `${b.exercise.target}s`
                    : `${b.exercise.target} reps`}
                </span>
              </div>
            ))}
          </div>
          <Button size="lg" className="w-full gap-2" onClick={handleStart}>
            <Play className="h-4 w-4" />
            Comenzar
          </Button>
        </div>
      )}

      {phase === "countin" && (
        <CountdownRing secondsLeft={secondsLeft} totalSeconds={COUNT_IN_SECONDS} color={categoryColor}>
          <span className="text-[64px] font-semibold tabular-nums">{secondsLeft}</span>
        </CountdownRing>
      )}

      {phase === "work" && (
        <div className="flex w-full max-w-md flex-col items-center gap-6 px-6">
          <span className="text-[13px] text-muted-foreground">
            Serie {roundIndex + 1}/{SETS_PER_SESSION} · Ejercicio {exerciseIndex + 1}/{blocks.length}
          </span>
          <div className="h-28 w-28 text-foreground">
            <ExerciseIllustration exercise={block.exercise} />
          </div>
          <h2 className="text-center text-[22px] font-semibold tracking-tight">
            {block.exercise.name}
          </h2>
          <p className="text-center text-[13px] text-muted-foreground">
            {block.exercise.instructions.join(" ")}
          </p>
          <CountdownRing secondsLeft={secondsLeft} totalSeconds={workSeconds} color={categoryColor}>
            <div className="flex flex-col items-center">
              <span className="text-[48px] font-semibold tabular-nums">{secondsLeft}</span>
              <span className="text-[12px] text-muted-foreground">
                {block.exercise.mode === "hold"
                  ? "sostené"
                  : `objetivo: ${block.exercise.target} reps`}
              </span>
            </div>
          </CountdownRing>
        </div>
      )}

      {(phase === "rest-exercise" || phase === "round-rest") && (
        <div className="flex w-full max-w-md flex-col items-center gap-6 px-6">
          <h2 className="text-[20px] font-semibold tracking-tight">
            {phase === "round-rest" ? "Descanso entre series" : "Descanso"}
          </h2>
          <CountdownRing
            secondsLeft={secondsLeft}
            totalSeconds={phase === "round-rest" ? ROUND_REST_SECONDS : REST_EXERCISE_SECONDS}
            color={categoryColor}
          >
            <span className="text-[48px] font-semibold tabular-nums">{secondsLeft}</span>
          </CountdownRing>
          {phase === "round-rest" && (
            <p className="text-center text-[13px] text-muted-foreground">
              Próximo: serie {roundIndex + 2}/{SETS_PER_SESSION} — {blocks[0].exercise.name}
            </p>
          )}
          {roundsCompleted >= 1 && (
            <Button variant="outline" size="sm" onClick={handleFinishEarly}>
              Terminar acá y guardar lo hecho
            </Button>
          )}
        </div>
      )}

      {phase === "reflection" && (
        <div className="flex w-full max-w-md flex-col gap-5 px-6">
          <h2 className="text-center text-[22px] font-semibold tracking-tight">
            ¡Terminaste {roundsCompleted}/{SETS_PER_SESSION} series!
          </h2>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium">¿Cómo te sentiste?</label>
            <Textarea
              value={felt}
              onChange={(e) => setFelt(e.target.value)}
              placeholder="Contanos cómo fue — con energía, cansado, te costó alguna..."
              className="min-h-20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium">
              ¿Hiciste todas las repeticiones y series tal como decía la rutina?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHonestEffort(true)}
                className={`flex-1 rounded-lg border py-2 text-[14px] transition-spring duration-150 ${
                  honestEffort === true
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Sí, todas
              </button>
              <button
                type="button"
                onClick={() => setHonestEffort(false)}
                className={`flex-1 rounded-lg border py-2 text-[14px] transition-spring duration-150 ${
                  honestEffort === false
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Alguna me costó
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium">
              ¿Hiciste otra actividad hoy? (opcional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bici, deporte, lo que sea"
              className="min-h-16"
            />
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={saving || !felt.trim() || honestEffort === null}
            onClick={handleSubmitReflection}
          >
            Guardar
          </Button>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <h2 className="text-[26px] font-semibold tracking-tight">¡Sumaste {points} pts!</h2>
          <p className="text-[14px] text-muted-foreground">Un paso más en tu expedición.</p>
          <div className="mt-2 flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button className="gap-2" onClick={onRequestPhoto}>
              <Camera className="h-4 w-4" />
              Agregar foto de progreso
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
