import { scheduleService } from "@/features/schedules/services/schedule.service";
import { scheduleSchema } from "@/features/schedules/schemas/schedule.schema";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function GET() {
  try {
    const schedules = await scheduleService.getAllSchedules();
    return apiSuccess(schedules);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Validasi data gagal",
        validation.error.flatten().fieldErrors,
      );
    }

    const newSchedule = await scheduleService.createSchedule(validation.data);
    return apiSuccess(newSchedule, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
