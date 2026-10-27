import { NextResponse } from "next/server";
import {
  updateReminderLog,
  deleteReminderLog,
} from "@/features/reminders/services/reminder.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateReminderLog(id, body);
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteReminderLog(id);
    return NextResponse.json(
      { message: "Log pengingat berhasil dihapus" },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
