import { createClient } from "@/lib/supabase/server";
import { CategoryManager, type Category } from "./category-manager";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  return <CategoryManager categories={(categories ?? []) as Category[]} />;
}
