import { supabase } from "@/lib/supabase";
import { Schedule } from "@/types/database.types";
import { DatabaseError, NotFoundError } from "@/lib/errors";

export class ScheduleRepository {
  async findAll(): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("datetime", { ascending: true });

    if (error) {
      throw new DatabaseError(
        "Gagal mengambil data jadwal dari database",
        error,
      );
    }

    return data || [];
  }

  async findById(id: string): Promise<Schedule> {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError(`Jadwal dengan ID ${id} tidak ditemukan`);
    }

    return data;
  }

  async create(
    scheduleData: Omit<Schedule, "id" | "created_at">,
  ): Promise<Schedule> {
    const { data, error } = await supabase
      .from("schedules")
      .insert([scheduleData])
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Gagal membuat jadwal baru", error);
    }

    return data;
  }

  async update(
    id: string,
    scheduleData: Partial<Omit<Schedule, "id" | "created_at">>,
  ): Promise<Schedule> {
    const { data, error } = await supabase
      .from("schedules")
      .update(scheduleData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new DatabaseError(`Gagal memperbarui jadwal ID ${id}`, error);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("schedules").delete().eq("id", id);

    if (error) {
      throw new DatabaseError(`Gagal menghapus jadwal ID ${id}`, error);
    }
  }
}

export const scheduleRepository = new ScheduleRepository();
