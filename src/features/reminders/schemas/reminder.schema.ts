import { z } from "zod";

export const reminderSchema = z.object({
  customer_id: z.string().min(1, "Customer wajib dipilih"),
  schedule_id: z.string().min(1, "Pilih jadwal kelas terlebih dahulu"),
  draft_message: z.string().min(5, "Draf pesan minimal 5 karakter"),
  status: z.enum(["Scheduled", "Sent", "Responded", "No Response"]),
  priority: z.enum(["Low", "Medium", "High"]),
});

export const updateReminderSchema = reminderSchema.partial();

export type ReminderSchemaInput = z.infer<typeof reminderSchema>;
