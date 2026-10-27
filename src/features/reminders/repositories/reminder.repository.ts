import { supabase } from "@/lib/supabase";
import { ReminderLog } from "@/types/database.types";
import { DatabaseError, NotFoundError } from "@/lib/errors";

export class ReminderRepository {
  async findAll(): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("reminder_logs")
      .select(
        `
        *,
        customers (name, phone, cancellation_count, attendance_rate),
        schedules (class_name, datetime)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(
        "Gagal mengambil log pengingat dari database",
        error,
      );
    }

    return data || [];
  }

  async findToday(): Promise<unknown[]> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    ).toISOString();

    const { data, error } = await supabase
      .from("reminder_logs")
      .select(
        `
        *,
        customers (name, phone, cancellation_count, attendance_rate),
        schedules (class_name, datetime)
      `,
      )
      .gte("schedules.datetime", startOfDay)
      .lte("schedules.datetime", endOfDay)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError("Gagal mengambil pengingat hari ini", error);
    }

    return (data || []).filter((item) => item.schedules !== null);
  }

  async findById(id: string): Promise<ReminderLog> {
    const { data, error } = await supabase
      .from("reminder_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError(`Log pengingat dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async create(
    reminderData: Omit<ReminderLog, "id" | "created_at">,
  ): Promise<ReminderLog> {
    const { data, error } = await supabase
      .from("reminder_logs")
      .insert([reminderData])
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Gagal membuat log pengingat baru", error);
    }

    return data;
  }

  async update(
    id: string,
    reminderData: Partial<Omit<ReminderLog, "id" | "created_at">>,
  ): Promise<ReminderLog> {
    const { data, error } = await supabase
      .from("reminder_logs")
      .update(reminderData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new DatabaseError(
        `Gagal memperbarui log pengingat ID ${id}`,
        error,
      );
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("reminder_logs")
      .delete()
      .eq("id", id);

    if (error) {
      throw new DatabaseError(`Gagal menghapus log pengingat ID ${id}`, error);
    }
  }
}

export const reminderRepository = new ReminderRepository();
