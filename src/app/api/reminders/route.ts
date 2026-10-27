import { NextResponse } from "next/server";
import {
  getReminderLogs,
  createReminderLog,
} from "@/features/reminders/services/reminder.service";
import { reminderSchema } from "@/features/reminders/schemas/reminder.schema";

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
    const validation = reminderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const newLog = await createReminderLog(validation.data);
    return NextResponse.json({ data: newLog }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
