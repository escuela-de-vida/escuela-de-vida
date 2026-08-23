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
import type { SubjectModuleInput } from "./actions";
import {
  createSubjectModule,
  updateSubjectModule,
  deleteSubjectModule,
} from "./actions";
import type { ModuleContent } from "@/lib/curriculum/types";

type Category = { id: string; name: string; color: string };
type SubjectModule = SubjectModuleInput & { id: string };

const KIND_OPTIONS: { value: ModuleContent["kind"]; label: string }[] = [
  { value: "reflexion", label: "Reflexión (texto)" },
  { value: "escritura", label: "Escritura (texto)" },
  { value: "quiz", label: "Quiz (opción múltiple)" },
  { value: "info", label: "Solo información" },
];

const QUIZ_PLACEHOLDER = `[
  { "question": "¿Pregunta?", "options": ["A", "B", "C"], "correctIndex": 0 }
]`;

function emptyForm(categoryId: string): SubjectModuleInput {
  return {
    category_id: categoryId,
    stage: "",
    order_index: 0,
    title: "",
    description: "",
    content: { kind: "reflexion", instructions: "" },
    points: 15,
    active: true,
  };
}

export function ModuleManager({
  modules,
  categories,
}: {
  modules: SubjectModule[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectModule | null>(null);
  const [form, setForm] = useState<SubjectModuleInput>(
    emptyForm(categories[0]?.id ?? ""),
  );
  const [rubricText, setRubricText] = useState("");
  const [quizText, setQuizText] = useState(QUIZ_PLACEHOLDER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(categories[0]?.id ?? ""));
    setRubricText("");
    setQuizText(QUIZ_PLACEHOLDER);
    setError("");
    setOpen(true);
  }

  function openEdit(module: SubjectModule) {
    setEditing(module);
    setForm({
      category_id: module.category_id,
      stage: module.stage,
      order_index: module.order_index,
      title: module.title,
      description: module.description,
      content: module.content,
      points: module.points,
      active: module.active,
    });
    setRubricText((module.content.rubric ?? []).join("\n"));
    setQuizText(
      module.content.quiz
        ? JSON.stringify(module.content.quiz, null, 2)
        : QUIZ_PLACEHOLDER,
    );
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const content: ModuleContent = {
      kind: form.content.kind,
      instructions: form.content.instructions,
      rubric: rubricText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    };

    if (form.content.kind === "quiz") {
      try {
        content.quiz = JSON.parse(quizText);
      } catch {
        setError("El quiz no es JSON válido.");
        setSaving(false);
        return;
      }
    }

    const payload: SubjectModuleInput = { ...form, content };

    try {
      if (editing) {
        await updateSubjectModule(editing.id, payload);
      } else {
        await createSubjectModule(payload);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Borrar este módulo? No se puede deshacer.")) return;
    await deleteSubjectModule(id);
  }

  const noCategories = categories.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">Módulos</h1>
        <Button onClick={openCreate} disabled={noCategories} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo módulo
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar módulo" : "Nuevo módulo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Descripción corta</Label>
                <Input
                  id="description"
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Materia</Label>
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
                <div className="flex flex-col gap-2">
                  <Label htmlFor="stage">Etapa (opcional)</Label>
                  <Input
                    id="stage"
                    value={form.stage ?? ""}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={form.order_index}
                    onChange={(e) =>
                      setForm({ ...form, order_index: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="points">Puntos</Label>
                  <Input
                    id="points"
                    type="number"
                    min={0}
                    value={form.points}
                    onChange={(e) =>
                      setForm({ ...form, points: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tipo de contenido</Label>
                <Select
                  value={form.content.kind}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      content: {
                        ...form.content,
                        kind: (v ?? "reflexion") as ModuleContent["kind"],
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {(v: ModuleContent["kind"]) =>
                        KIND_OPTIONS.find((k) => k.value === v)?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {KIND_OPTIONS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="instructions">Instrucciones / consigna</Label>
                <Textarea
                  id="instructions"
                  required
                  className="min-h-24"
                  value={form.content.instructions}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      content: { ...form.content, instructions: e.target.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rubric">Rúbrica (una línea por criterio)</Label>
                <Textarea
                  id="rubric"
                  className="min-h-16"
                  value={rubricText}
                  onChange={(e) => setRubricText(e.target.value)}
                />
              </div>
              {form.content.kind === "quiz" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="quiz">Preguntas (JSON)</Label>
                  <Textarea
                    id="quiz"
                    className="min-h-32 font-mono text-xs"
                    value={quizText}
                    onChange={(e) => setQuizText(e.target.value)}
                  />
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="active" className="cursor-pointer">
                  Activo
                </Label>
                <Switch
                  id="active"
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
              </div>
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
              <TableHead>Materia</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Todavía no hay módulos.
                </TableCell>
              </TableRow>
            )}
            {modules.map((module) => {
              const category = categoryById.get(module.category_id);
              return (
                <TableRow key={module.id}>
                  <TableCell>{module.title}</TableCell>
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
                    {module.order_index}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {module.content.kind}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {module.points}
                  </TableCell>
                  <TableCell>
                    <Badge variant={module.active ? "secondary" : "outline"}>
                      {module.active ? "Activo" : "Archivado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(module)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(module.id)}
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
