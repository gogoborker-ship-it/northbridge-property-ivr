import { NextResponse } from "next/server";
import { runSurgeDesk } from "@shared/surge/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return NextResponse.json(runSurgeDesk());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The agents could not read the hour.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
