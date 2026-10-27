import { supabase } from "@/lib/supabase";
import { ReminderLog } from "@/types/database.types";

export async function getReminderLogs() {
  const { data, error } = await supabase
    .from("reminder_logs")
    .select(
      `
      *,
      customers (name, phone),
      schedules (class_name, datetime)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil log pengingat: ${error.message}`);
  }

  return data || [];
}

export async function createReminderLog(
  reminderData: Omit<ReminderLog, "id" | "created_at">,
): Promise<ReminderLog> {
  const { data, error } = await supabase
    .from("reminder_logs")
    .insert([reminderData])
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membuat log pengingat: ${error.message}`);
  }

  return data;
}

export async function updateReminderLog(
  id: string,
  reminderData: Partial<Omit<ReminderLog, "id" | "created_at">>,
): Promise<ReminderLog> {
  const { data, error } = await supabase
    .from("reminder_logs")
    .update(reminderData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui log pengingat: ${error.message}`);
  }

  return data;
}

export async function deleteReminderLog(id: string): Promise<void> {
  const { error } = await supabase.from("reminder_logs").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus log pengingat: ${error.message}`);
  }
}
