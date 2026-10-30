import {
  bookingRepository,
  BookingRepository,
  BookingWithSchedule,
  BookingWithCustomer,
} from "../repositories/booking.repository";
import { Booking } from "@/types/database.types";
import { ValidationError } from "@/lib/errors";

export class BookingService {
  constructor(private repo: BookingRepository = bookingRepository) {}

  async getCustomerSchedules(
    customerId: string,
  ): Promise<BookingWithSchedule[]> {
    return await this.repo.findSchedulesByCustomerId(customerId);
  }

  async getScheduleParticipants(
    scheduleId: string,
  ): Promise<BookingWithCustomer[]> {
    return await this.repo.findCustomersByScheduleId(scheduleId);
  }

  async createBooking(
    customerId: string,
    scheduleId: string,
  ): Promise<Booking> {
    // 1. Cek ketersediaan jadwal & kuota
    const quota = await this.repo.getScheduleQuota(scheduleId);
    if (quota === null) {
      throw new ValidationError("Jadwal kelas tidak ditemukan");
    }

    // 2. Cek pendaftaran ganda (Cegah Error 500 / unique constraint violation)
    const existing = await this.repo.findSchedulesByCustomerId(customerId);
    if (existing.some((b) => b.schedule_id === scheduleId)) {
      throw new ValidationError("Customer sudah terdaftar pada kelas ini");
    }

    // 3. Hitung jumlah pendaftar saat ini
    const currentCount = await this.repo.countByScheduleId(scheduleId);
    if (currentCount >= quota) {
      throw new ValidationError("Kelas ini sudah penuh (kuota telah tercapai)");
    }

    // 4. Simpan booking
    return await this.repo.create({
      customer_id: customerId,
      schedule_id: scheduleId,
      status: "Booked",
    });
  }

  async removeBooking(bookingId: string): Promise<void> {
    return await this.repo.delete(bookingId);
  }
}

export const bookingService = new BookingService();
