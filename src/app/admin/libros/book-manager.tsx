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
import type { BookInput } from "./actions";
import { createBook, updateBook, deleteBook } from "./actions";

type Category = { id: string; name: string; color: string };
type Book = BookInput & { id: string };

const NO_CATEGORY = "__none__";

const EMPTY: BookInput = {
  title: "",
  author: "",
  category_id: null,
  total_pages: null,
  active: true,
};

export function BookManager({
  books,
  categories,
}: {
  books: Book[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState<BookInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setOpen(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author,
      category_id: book.category_id,
      total_pages: book.total_pages,
      active: book.active,
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
        await updateBook(editing.id, form);
      } else {
        await createBook(form);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Borrar este libro? No se puede deshacer.")) return;
    await deleteBook(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">Libros</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo libro
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar libro" : "Nuevo libro"}
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
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={form.author ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, author: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Categoría</Label>
                  <Select
                    value={form.category_id ?? NO_CATEGORY}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        category_id: v === NO_CATEGORY ? null : v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {(id: string) =>
                          id === NO_CATEGORY
                            ? "Sin asignar"
                            : (categoryById.get(id)?.name ?? "")
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>Sin asignar</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pages">Páginas</Label>
                  <Input
                    id="pages"
                    type="number"
                    min={0}
                    value={form.total_pages ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        total_pages: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="active" className="cursor-pointer">
                  Activo en el catálogo
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

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Todavía no hay libros en el catálogo.
                </TableCell>
              </TableRow>
            )}
            {books.map((book) => {
              const category = book.category_id
                ? categoryById.get(book.category_id)
                : null;
              return (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {book.author}
                  </TableCell>
                  <TableCell>
                    {category ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: category.color }}
                          aria-hidden
                        />
                        {category.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={book.active ? "secondary" : "outline"}>
                      {book.active ? "Activo" : "Archivado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(book)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(book.id)}
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
