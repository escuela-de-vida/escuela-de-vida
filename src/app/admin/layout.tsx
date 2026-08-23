import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass, Shapes, ListTodo, BookOpen, Milestone } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/admin/categorias", label: "Categorías", icon: Shapes },
  { href: "/admin/tareas", label: "Tareas", icon: ListTodo },
  { href: "/admin/modulos", label: "Módulos", icon: Milestone },
  { href: "/admin/libros", label: "Libros", icon: BookOpen },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }
  if (profile.role !== "parent_admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="glass-panel sticky top-0 z-10 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "var(--category-conocimiento)" }}
            >
              <Compass className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
            <span className="text-[17px] font-semibold tracking-tight">
              Escuela de Vida
            </span>
          </Link>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Admin
          </Badge>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-10 px-8 py-10">
        <nav className="flex w-48 shrink-0 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-muted-foreground transition-spring duration-200 hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
