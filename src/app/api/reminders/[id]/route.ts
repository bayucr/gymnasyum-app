import { reminderService } from "@/features/reminders/services/reminder.service";
import { updateReminderSchema } from "@/features/reminders/schemas/reminder.schema";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateReminderSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Validasi data gagal",
        validation.error.flatten().fieldErrors,
      );
    }

    const updated = await reminderService.updateReminder(id, validation.data);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await reminderService.deleteReminder(id);
    return apiSuccess({ message: "Log pengingat berhasil dihapus" });
  } catch (error) {
    return handleApiError(error);
  }
}
