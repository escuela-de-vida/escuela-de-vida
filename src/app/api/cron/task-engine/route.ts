import { NextResponse } from "next/server";
import { generateInstancesForToday } from "@/lib/task-engine/generate";
import { sweepOverdueInstances } from "@/lib/task-engine/sweep";

export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const today = new Date();
  const generated = await generateInstancesForToday(today);
  const swept = await sweepOverdueInstances(today);

  return NextResponse.json({ ok: true, generated, swept });
}
