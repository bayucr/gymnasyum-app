import { supabase } from "@/lib/supabase";
import { Booking, Customer, Schedule } from "@/types/database.types";
import { DatabaseError, ValidationError } from "@/lib/errors";

export interface BookingWithSchedule extends Booking {
  schedules: Schedule;
}

export interface BookingWithCustomer extends Booking {
  customers: Customer;
}

export class BookingRepository {
  async findSchedulesByCustomerId(
    customerId: string,
  ): Promise<BookingWithSchedule[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, schedules(*)")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError("Gagal mengambil daftar kelas customer", error);
    }

    return (data as unknown as BookingWithSchedule[]) || [];
  }

  async getScheduleQuota(scheduleId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from("schedules")
      .select("quota")
      .eq("id", scheduleId)
      .single();

    if (error || !data) return null;
    return data.quota;
  }

  async countByScheduleId(scheduleId: string): Promise<number> {
    const { count, error } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("schedule_id", scheduleId);

    if (error) {
      throw new DatabaseError("Gagal menghitung jumlah peserta kelas", error);
    }

    return count || 0;
  }

  async findCustomersByScheduleId(
    scheduleId: string,
  ): Promise<BookingWithCustomer[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, customers(*)")
      .eq("schedule_id", scheduleId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError("Gagal mengambil daftar peserta kelas", error);
    }

    return (data as unknown as BookingWithCustomer[]) || [];
  }

  async create(
    bookingData: Omit<Booking, "id" | "created_at" | "updated_at">,
  ): Promise<Booking> {
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ValidationError("Customer sudah terdaftar di sesi kelas ini");
      }
      throw new DatabaseError("Gagal mendaftarkan customer ke kelas", error);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) {
      throw new DatabaseError(`Gagal menghapus reservasi ID ${id}`, error);
    }
  }
}

export const bookingRepository = new BookingRepository();
