"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
      <LogOut className="h-4 w-4" />
      Salir
    </Button>
  );
}
