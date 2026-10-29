import { createBookingSchema } from "@/features/bookings/schemas/booking.schema";
import { bookingService } from "@/features/bookings/services/booking.service";
import { handleApiError, apiSuccess } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = createBookingSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        "Validasi data booking gagal",
        validation.error.flatten().fieldErrors,
      );
    }

    const { customer_id, schedule_id } = validation.data;

    const newBooking = await bookingService.createBooking(
      customer_id,
      schedule_id,
    );
    return apiSuccess(newBooking, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
