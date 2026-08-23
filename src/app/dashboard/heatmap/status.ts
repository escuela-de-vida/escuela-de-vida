import { toISODate } from "@/lib/dates";
import type { HeatmapInstance } from "@/lib/dashboard/queries";

export type DisplayStatus = "hecho" | "atrasado" | "pendiente" | "no_hecho" | "reprogramado";

export function getDisplayStatus(instance: HeatmapInstance): DisplayStatus {
  if (instance.status === "hecho") return "hecho";
  if (instance.status === "no_hecho") return "no_hecho";
  if (instance.status === "reprogramado") return "reprogramado";

  const isPast = instance.scheduled_date < toISODate(new Date());
  return isPast ? "atrasado" : "pendiente";
}
