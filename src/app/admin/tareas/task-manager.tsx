"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TaskTemplateInput } from "./actions";
import {
  createTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
} from "./actions";
import { ChecklistManager, type ChecklistItemRow } from "./checklist-manager";

type Category = { id: string; name: string; color: string };
type TaskTemplate = TaskTemplateInput & { id: string };

const RECURRENCE_OPTIONS = [
  "Diaria",
  "2-3x/semana",
  "2x/semana",
  "Semanal",
  "Sem/mensual",
  "Mensual",
  "Anual",
  "Oportunista",
];

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

function needsDayPicker(recurrence: string) {
  return ["2x/semana", "2-3x/semana", "Semanal", "Sem/mensual"].includes(
    recurrence,
  );
}

function emptyForm(categoryId: string): TaskTemplateInput {
  return {
    category_id: categoryId,
    title: "",
    description: "",
    points_base: 10,
    duration_minutes: 25,
    recurrence: "Diaria",
    recurrence_days: null,
    focus_batch_required: true,
    active: true,
  };
}

export function TaskManager({
  tasks,
  categories,
  checklistItems,
}: {
  tasks: TaskTemplate[];
  categories: Category[];
  checklistItems: ChecklistItemRow[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskTemplate | null>(null);
  const [form, setForm] = useState<TaskTemplateInput>(
    emptyForm(categories[0]?.id ?? ""),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(categories[0]?.id ?? ""));
    setError("");
    setOpen(true);
  }

  function openEdit(task: TaskTemplate) {
    setEditing(task);
    setForm({
      category_id: task.category_id,
      title: task.title,
      description: task.description,
      points_base: task.points_base,
      duration_minutes: task.duration_minutes,
      recurrence: task.recurrence,
      recurrence_days: task.recurrence_days,
      focus_batch_required: task.focus_batch_required,
      active: task.active,
    });
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateTaskTemplate(editing.id, form);
      } else {
        await createTaskTemplate(form);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Borrar esta tarea? No se puede deshacer.")) return;
    await deleteTaskTemplate(id);
  }

  const noCategories = categories.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">Tareas</h1>
        <Button onClick={openCreate} disabled={noCategories} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva tarea
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar tarea" : "Nueva tarea"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Categoría</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) =>
                    setForm({ ...form, category_id: v ?? "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {(id: string) => categoryById.get(id)?.name ?? ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="points">Puntos</Label>
                  <Input
                    id="points"
                    type="number"
                    min={0}
                    value={form.points_base}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        points_base: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="duration">Minutos</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={0}
                    value={form.duration_minutes ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duration_minutes: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Frecuencia</Label>
                  <Select
                    value={form.recurrence}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        recurrence: v ?? form.recurrence,
                        recurrence_days: needsDayPicker(v ?? form.recurrence)
                          ? form.recurrence_days
                          : null,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {needsDayPicker(form.recurrence) && (
                <div className="flex flex-col gap-2">
                  <Label>Días de la semana</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((d) => {
                      const selected = (form.recurrence_days ?? []).includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              recurrence_days: selected
                                ? (form.recurrence_days ?? []).filter((v) => v !== d.value)
                                : [...(form.recurrence_days ?? []), d.value],
                            })
                          }
                          className={`rounded-full border px-3 py-1 text-[13px] transition-spring duration-150 ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Si no elegís ninguno, se usa el día por defecto de esta
                    frecuencia.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="focus" className="cursor-pointer">
                  Requiere batch de foco
                </Label>
                <Switch
                  id="focus"
                  checked={form.focus_batch_required}
                  onCheckedChange={(v) =>
                    setForm({ ...form, focus_batch_required: v })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="active" className="cursor-pointer">
                  Activa
                </Label>
                <Switch
                  id="active"
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
              </div>
              {editing && (
                <ChecklistManager
                  taskTemplateId={editing.id}
                  items={checklistItems.filter(
                    (i) => i.task_template_id === editing.id,
                  )}
                />
              )}
              {!editing && (
                <p className="text-[12px] text-muted-foreground">
                  Guardá la tarea primero para poder agregarle un checklist.
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {noCategories && (
        <p className="text-sm text-muted-foreground">
          Primero creá una categoría en{" "}
          <a href="/admin/categorias" className="underline">
            Categorías
          </a>
          .
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  Todavía no hay tareas.
                </TableCell>
              </TableRow>
            )}
            {tasks.map((task) => {
              const category = categoryById.get(task.category_id);
              return (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {category && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: category.color }}
                          aria-hidden
                        />
                        {category.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.recurrence}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.points_base}
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.active ? "secondary" : "outline"}>
                      {task.active ? "Activa" : "Archivada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(task)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
