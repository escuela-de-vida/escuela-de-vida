"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  type ChecklistItemInput,
} from "./checklist-actions";

export type ChecklistItemRow = ChecklistItemInput & { id: string };

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

function emptyItem(taskTemplateId: string, order: number): ChecklistItemInput {
  return {
    task_template_id: taskTemplateId,
    label: "",
    points: 5,
    duration_minutes: 5,
    recurrence_days: null,
    order_index: order,
  };
}

function ItemRow({
  item,
  onSaved,
}: {
  item: ChecklistItemRow;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ChecklistItemInput>(item);
  const [saving, setSaving] = useState(false);

  async function handleBlurSave() {
    setSaving(true);
    try {
      await updateChecklistItem(item.id, form);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteChecklistItem(item.id);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <Input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          onBlur={handleBlurSave}
          placeholder="Ej. Cepillado de dientes"
          className="flex-1"
        />
        <Input
          type="number"
          min={0}
          value={form.points}
          onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
          onBlur={handleBlurSave}
          className="w-16"
          title="Puntos"
        />
        <Input
          type="number"
          min={0}
          value={form.duration_minutes}
          onChange={(e) =>
            setForm({ ...form, duration_minutes: Number(e.target.value) })
          }
          onBlur={handleBlurSave}
          className="w-16"
          title="Minutos"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">Días:</span>
        {WEEKDAYS.map((d) => {
          const selected = (form.recurrence_days ?? []).includes(d.value);
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => {
                const next = selected
                  ? (form.recurrence_days ?? []).filter((v) => v !== d.value)
                  : [...(form.recurrence_days ?? []), d.value];
                const updated = { ...form, recurrence_days: next.length ? next : null };
                setForm(updated);
                updateChecklistItem(item.id, updated).then(onSaved);
              }}
              className={`rounded-full border px-2 py-0.5 text-[11px] transition-spring duration-150 ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {d.label}
            </button>
          );
        })}
        <span className="text-[11px] text-muted-foreground">
          {(form.recurrence_days ?? []).length === 0 && "(todos los días)"}
        </span>
      </div>
    </div>
  );
}

export function ChecklistManager({
  taskTemplateId,
  items,
}: {
  taskTemplateId: string;
  items: ChecklistItemRow[];
}) {
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await createChecklistItem(emptyItem(taskTemplateId, items.length));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-muted-foreground" />
        <Label>Checklist (opcional)</Label>
      </div>
      <p className="text-[12px] text-muted-foreground">
        Si agregás items, el batch de foco muestra esta lista en vez de un
        timer vacío — cada uno con sus propios días y puntos.
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onSaved={() => {}} />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        disabled={adding}
        className="w-fit gap-1.5"
      >
        {adding ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        Agregar item
      </Button>
    </div>
  );
}
