import {
  bookingRepository,
  BookingRepository,
  BookingWithSchedule,
  BookingWithCustomer,
} from "../repositories/booking.repository";
import { Booking } from "@/types/database.types";

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
