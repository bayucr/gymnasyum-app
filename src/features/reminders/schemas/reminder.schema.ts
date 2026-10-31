import { z } from "zod";

export const reminderSchema = z.object({
  customer_id: z.string().min(1, "Pilih customer"),
  schedule_id: z.string().min(1, "Pilih jadwal kelas"),
  draft_message: z.string().min(5, "Draf pesan minimal 5 karakter"),
  status: z.enum(["Scheduled", "Sent", "Responded", "No Response"] as const, {
    message: "Pilih status pengingat",
  }),
  priority: z.enum(["Low", "Medium", "High"] as const, {
    message: "Pilih tingkat prioritas",
  }),
});

export const updateReminderSchema = reminderSchema.partial();

export type ReminderSchemaInput = z.infer<typeof reminderSchema>;
