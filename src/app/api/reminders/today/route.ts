import { reminderService } from "@/features/reminders/services/reminder.service";
import { handleApiError, apiSuccess } from "@/lib/api-response";

export async function GET() {
  try {
    const todayReminders = await reminderService.getTodayReminders();
    return apiSuccess(todayReminders);
  } catch (error) {
    return handleApiError(error);
  }
}
