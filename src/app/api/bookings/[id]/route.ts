import { bookingService } from "@/features/bookings/services/booking.service";
import { handleApiError, apiSuccess } from "@/lib/api-response";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await bookingService.removeBooking(id);
    return apiSuccess({ message: "Pendaftaran kelas berhasil dibatalkan" });
  } catch (error) {
    return handleApiError(error);
  }
}
