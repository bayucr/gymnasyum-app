import { reminderService } from "@/features/reminders/services/reminder.service";
import { reminderSchema } from "@/features/reminders/schemas/reminder.schema";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function GET() {
  try {
    const reminders = await reminderService.getAllReminders();
    return apiSuccess(reminders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = reminderSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Validasi data gagal",
        validation.error.flatten().fieldErrors,
      );
    }

    const newReminder = await reminderService.createReminder(validation.data);
    return apiSuccess(newReminder, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
