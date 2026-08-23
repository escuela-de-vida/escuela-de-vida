import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Compass } from "lucide-react";

const CATEGORIES = [
  { key: "mente", name: "Mente", color: "var(--category-mente)" },
  { key: "cuerpo", name: "Cuerpo", color: "var(--category-cuerpo)" },
  {
    key: "conocimiento",
    name: "Conocimiento",
    color: "var(--category-conocimiento)",
  },
  {
    key: "creatividad",
    name: "Creatividad",
    color: "var(--category-creatividad)",
  },
  {
    key: "comunidad",
    name: "Comunidad y Mundo",
    color: "var(--category-comunidad)",
  },
  {
    key: "vida-practica",
    name: "Vida Práctica",
    color: "var(--category-vida-practica)",
  },
  {
    key: "comunicacion",
    name: "Comunicación",
    color: "var(--category-comunicacion)",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="glass-panel sticky top-0 z-10 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "var(--category-conocimiento)" }}
          >
            <Compass className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-[17px] font-semibold tracking-tight">
            Escuela de Vida
          </span>
        </div>
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          Fase 0 · Fundación
        </Badge>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-8 py-16">
        <section className="flex flex-col gap-3">
          <h1 className="text-[34px] font-semibold leading-tight tracking-tight">
            Proyecto Brújula
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            La base técnica y el sistema de diseño ya están corriendo. El
            dashboard, el motor de tareas y el currículo llegan en las
            próximas fases del roadmap.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <Card
              key={category.key}
              className="transition-spring duration-300 hover:-translate-y-0.5"
            >
              <CardHeader className="flex flex-row items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: category.color }}
                  aria-hidden
                />
                <div className="flex flex-col">
                  <CardTitle className="text-[17px]">
                    {category.name}
                  </CardTitle>
                  <CardDescription>Categoría madre</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Color de acento reservado para íconos, insignias y barras de
                progreso — nunca como fondo de pantalla completo.
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
