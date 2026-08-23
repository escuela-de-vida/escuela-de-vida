import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getCategories } from "@/lib/curriculum/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MateriasIndexPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const categories = await getCategories();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="glass-panel sticky top-0 z-10 flex items-center gap-3 px-8 py-4">
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
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-8 py-10">
        <h1 className="text-[28px] font-semibold tracking-tight">Materias</h1>

        {categories.length === 0 ? (
          <p className="text-[15px] text-muted-foreground">
            Todavía no hay materias configuradas.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/materias/${category.slug}`}>
                <Card className="h-full transition-spring duration-300 hover:-translate-y-0.5">
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
                      <CardDescription className="capitalize">
                        {category.type}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Ver el camino de expedición de esta materia.
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
