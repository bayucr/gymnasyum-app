import { bookingService } from "@/features/bookings/services/booking.service";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, schedule_id } = body;

    if (!customer_id || !schedule_id) {
      throw new ValidationError("customer_id dan schedule_id wajib diisi", {
        customer_id: !customer_id ? ["Customer ID wajib diisi"] : undefined,
        schedule_id: !schedule_id ? ["Schedule ID wajib diisi"] : undefined,
      });
    }

    const newBooking = await bookingService.createBooking(
      customer_id,
      schedule_id,
    );
    return apiSuccess(newBooking, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
