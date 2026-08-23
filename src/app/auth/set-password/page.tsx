"use client";

import { useEffect, useState } from "react";
import { Compass, Loader2 } from "lucide-react";
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

export default function SetPasswordPage() {
  const [ready, setReady] = useState<"checking" | "ready" | "no-session">(
    "checking",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function establishSession() {
      // Los links de invitación/recuperación llegan con los tokens en el
      // hash (flujo implícito, no PKCE) — los tomamos a mano en vez de
      // confiar en la detección automática del SDK.
      const params = new URLSearchParams(window.location.hash.slice(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        history.replaceState(null, "", window.location.pathname);
        setReady(data.session && !error ? "ready" : "no-session");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setReady(session ? "ready" : "no-session");
    }

    establishSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("La contraseña necesita al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setStatus("loading");
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }
    window.location.href = "/dashboard";
  }

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
            <CardTitle className="text-[17px]">Elegí tu contraseña</CardTitle>
            <CardDescription>
              Esta va a ser tu forma de entrar como admin de la familia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ready === "checking" && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {ready === "no-session" && (
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Este link ya no es válido o expiró. Pedí que te reenvíen la
                invitación.
              </p>
            )}
            {ready === "ready" && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm">Repetila</Label>
                  <Input
                    id="confirm"
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="gap-2"
                >
                  {status === "loading" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Guardar y entrar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
