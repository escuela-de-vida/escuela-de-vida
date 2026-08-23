import { createClient } from "@/lib/supabase/server";
import { BookManager } from "./book-manager";

export default async function LibrosPage() {
  const supabase = await createClient();
  const [{ data: books }, { data: categories }] = await Promise.all([
    supabase.from("books").select("*").order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, color")
      .eq("active", true)
      .order("display_order", { ascending: true }),
  ]);

  return <BookManager books={books ?? []} categories={categories ?? []} />;
}
