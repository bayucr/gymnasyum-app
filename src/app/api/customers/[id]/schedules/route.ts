import { bookingService } from "@/features/bookings/services/booking.service";
import { handleApiError, apiSuccess } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bookings = await bookingService.getCustomerSchedules(id);
    return apiSuccess(bookings);
  } catch (error) {
    return handleApiError(error);
  }
}
