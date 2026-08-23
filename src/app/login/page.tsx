"use client";

import { useEffect, useState } from "react";
import { Compass, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2
          className="h-10 w-10 text-[var(--category-conocimiento)]"
          strokeWidth={1.5}
        />
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Te mandamos un link mágico a <strong>{email}</strong>. Abrilo desde
          este mismo dispositivo para entrar.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="student-email">Tu email</Label>
        <Input
          id="student-email"
          type="email"
          placeholder="vos@familia.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-destructive">
          Algo falló al enviar el link. Probá de nuevo.
        </p>
      )}
      <Button type="submit" disabled={status === "loading"} className="gap-2">
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        Enviarme el link mágico
      </Button>
    </form>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setStatus("error");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="familia@heyhermann.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-password">Contraseña</Label>
        <Input
          id="admin-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-destructive">
          Email o contraseña incorrectos.
        </p>
      )}
      <Button type="submit" disabled={status === "loading"} className="gap-2">
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        Entrar
      </Button>
    </form>
  );
}

export default function LoginPage() {
  useEffect(() => {
    // Los links de invitación/recuperación generados por el admin ignoran
    // cualquier redirect_to custom y siempre caen en el Site URL — llegan acá
    // con el token en el hash. Los mandamos a completar su contraseña.
    const hash = window.location.hash;
    if (hash.includes("access_token") && (hash.includes("type=invite") || hash.includes("type=recovery"))) {
      window.location.replace(`/auth/set-password${hash}`);
    }
  }, []);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "var(--category-conocimiento)" }}
          >
            <Compass className="h-6 w-6 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight">
            Escuela de Vida
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[17px]">Bienvenido de vuelta</CardTitle>
            <CardDescription>
              Elegí cómo querés entrar a tu expedición.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Alumno</TabsTrigger>
                <TabsTrigger value="admin">Familia / Admin</TabsTrigger>
              </TabsList>
              <TabsContent value="student" className="pt-4">
                <StudentLogin />
              </TabsContent>
              <TabsContent value="admin" className="pt-4">
                <AdminLogin />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
