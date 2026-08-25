"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { upsertStudentBodyConfig } from "./actions";
import { getWeeklySplit, DAY_TYPE_LABEL } from "@/lib/body/routine";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABEL: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};

type Config = {
  weight_kg: number | null;
  age_years: number | null;
  days_per_week: number;
} | null;

export function BodyConfigCard({
  studentId,
  studentName,
  config,
}: {
  studentId: string;
  studentName: string;
  config: Config;
}) {
  const [weightKg, setWeightKg] = useState<string>(
    config?.weight_kg != null ? String(config.weight_kg) : "",
  );
  const [ageYears, setAgeYears] = useState<string>(
    config?.age_years != null ? String(config.age_years) : "",
  );
  const [daysPerWeek, setDaysPerWeek] = useState<number>(config?.days_per_week ?? 3);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const split = getWeeklySplit(daysPerWeek);
  const dayTypeByWeekday = new Map(split.map((d) => [d.weekday, d.dayType]));

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await upsertStudentBodyConfig({
        studentId,
        weightKg: weightKg ? Number(weightKg) : null,
        ageYears: ageYears ? Number(ageYears) : null,
        daysPerWeek,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[17px]">{studentName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Peso (kg)</Label>
            <Input
              type="number"
              min={0}
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Edad</Label>
            <Input
              type="number"
              min={6}
              max={18}
              value={ageYears}
              onChange={(e) => setAgeYears(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Días/semana</Label>
            <div className="flex gap-1">
              {[3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDaysPerWeek(n)}
                  className={`h-9 flex-1 rounded-lg border text-[14px] transition-spring duration-150 ${
                    daysPerWeek === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] text-muted-foreground">
            Vista previa de la semana
          </span>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_ORDER.map((weekday) => {
              const dayType = dayTypeByWeekday.get(weekday);
              return (
                <div
                  key={weekday}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center ${
                    dayType ? "border-border" : "border-dashed border-border/60"
                  }`}
                >
                  <span className="text-[11px] font-medium">{WEEKDAY_LABEL[weekday]}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {dayType ? DAY_TYPE_LABEL[dayType].split(" ")[0] : "Descanso"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="w-fit gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </Button>
          {saved && !saving && (
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <Check className="h-3.5 w-3.5" /> Guardado
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
