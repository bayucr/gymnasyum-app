import { NextResponse } from "next/server";
import {
  updateReminderLog,
  deleteReminderLog,
} from "@/features/reminders/services/reminder.service";
import { updateReminderSchema } from "@/features/reminders/schemas/reminder.schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateReminderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const updated = await updateReminderLog(id, validation.data);
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
