import { scheduleService } from "@/features/schedules/services/schedule.service";
import { updateScheduleSchema } from "@/features/schedules/schemas/schedule.schema";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateScheduleSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        "Validasi data gagal",
        validation.error.flatten().fieldErrors,
      );
    }

    const updated = await scheduleService.updateSchedule(id, validation.data);
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
    await scheduleService.deleteSchedule(id);
    return apiSuccess({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    return handleApiError(error);
  }
}
