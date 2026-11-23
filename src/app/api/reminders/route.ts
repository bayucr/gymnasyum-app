import { reminderService } from "@/features/reminders/services/reminder.service";
import { reminderSchema } from "@/features/reminders/schemas/reminder.schema";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { PriorityLevel, ReminderStatus } from "@/types/database.types";

const VALID_STATUSES: ReminderStatus[] = [
  "Scheduled",
  "Sent",
  "Responded",
  "No Response",
];
const VALID_PRIORITIES: PriorityLevel[] = ["Low", "Medium", "High"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const hasPaginationOrFilter =
      searchParams.has("page") ||
      searchParams.has("limit") ||
      searchParams.has("search") ||
      searchParams.has("status") ||
      searchParams.has("priority");

    if (!hasPaginationOrFilter) {
      const reminders = await reminderService.getAllReminders();
      return apiSuccess(reminders);
    }

    const rawPage = Number(searchParams.get("page") || "1");
    const rawLimit = Number(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const rawStatus = searchParams.get("status") as ReminderStatus | null;
    const rawPriority = searchParams.get("priority") as PriorityLevel | null;

    const result = await reminderService.getPaginatedReminders({
      page: Number.isNaN(rawPage) ? 1 : rawPage,
      limit: Number.isNaN(rawLimit) ? 10 : rawLimit,
      search,
      status:
        rawStatus && VALID_STATUSES.includes(rawStatus) ? rawStatus : undefined,
      priority:
        rawPriority && VALID_PRIORITIES.includes(rawPriority)
          ? rawPriority
          : undefined,
    });

    return apiSuccess(result);
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
