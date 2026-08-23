"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CategoryInput } from "./actions";
import { createCategory, updateCategory, deleteCategory } from "./actions";

export type Category = CategoryInput & { id: string };

const EMPTY: CategoryInput = {
  name: "",
  color: "#0071e3",
  icon: "",
  type: "materia",
  display_order: 0,
  active: true,
  supports_tracks: false,
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
      display_order: category.display_order,
      active: category.active,
      supports_tracks: category.supports_tracks,
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
        await updateCategory(editing.id, form);
      } else {
        await createCategory(form);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Borrar esta categoría? No se puede deshacer.")) return;
    await deleteCategory(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Categorías
        </h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar categoría" : "Nueva categoría"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) =>
                        setForm({ ...form, color: e.target.value })
                      }
                      className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-border"
                    />
                    <Input
                      id="color"
                      required
                      value={form.color}
                      onChange={(e) =>
                        setForm({ ...form, color: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="icon">Ícono (lucide, opcional)</Label>
                  <Input
                    id="icon"
                    value={form.icon ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, icon: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as CategoryInput["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {(v: CategoryInput["type"]) =>
                          v === "habito" ? "Hábito" : "Materia"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materia">Materia</SelectItem>
                      <SelectItem value="habito">Hábito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={form.display_order}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        display_order: Number(e.target.value),
                      })
                    }
                  />
                </div>
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
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="tracks" className="cursor-pointer">
                  Admite tracks (ej. Computación)
                </Label>
                <Switch
                  id="tracks"
                  checked={form.supports_tracks}
                  onCheckedChange={(v) =>
                    setForm({ ...form, supports_tracks: v })
                  }
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

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Todavía no hay categorías.
                </TableCell>
              </TableRow>
            )}
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: category.color }}
                      aria-hidden
                    />
                    {category.name}
                  </div>
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {category.type}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {category.display_order}
                </TableCell>
                <TableCell>
                  <Badge variant={category.active ? "secondary" : "outline"}>
                    {category.active ? "Activa" : "Archivada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(category)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
