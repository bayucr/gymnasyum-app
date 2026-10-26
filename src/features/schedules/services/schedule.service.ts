import { supabase } from "@/lib/supabase";
import { Schedule } from "@/types/database.types";

export async function getSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .order("datetime", { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil data jadwal: ${error.message}`);
  }

  return data || [];
}

export async function createSchedule(
  scheduleData: Omit<Schedule, "id" | "created_at">,
): Promise<Schedule> {
  const { data, error } = await supabase
    .from("schedules")
    .insert([scheduleData])
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membuat jadwal baru: ${error.message}`);
  }

  return data;
}

export async function updateSchedule(
  id: string,
  scheduleData: Partial<Omit<Schedule, "id" | "created_at">>,
): Promise<Schedule> {
  const { data, error } = await supabase
    .from("schedules")
    .update(scheduleData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui jadwal: ${error.message}`);
  }

  return data;
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus jadwal: ${error.message}`);
  }
}
