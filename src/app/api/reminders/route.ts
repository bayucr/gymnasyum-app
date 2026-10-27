import { NextResponse } from "next/server";
import {
  getReminderLogs,
  createReminderLog,
} from "@/features/reminders/services/reminder.service";

export async function GET() {
  try {
    const logs = await getReminderLogs();
    return NextResponse.json({ data: logs }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLog = await createReminderLog(body);
    return NextResponse.json({ data: newLog }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
