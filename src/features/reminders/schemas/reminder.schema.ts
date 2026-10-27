import { z } from "zod";

export const reminderSchema = z.object({
  customer_id: z.string().uuid("ID Customer harus format UUID yang valid"),
  schedule_id: z.string().uuid("ID Jadwal harus format UUID yang valid"),
  draft_message: z.string().min(5, "Draf pesan minimal 5 karakter"),
  status: z
    .enum(["Scheduled", "Sent", "Responded", "No Response"])
    .optional()
    .default("Scheduled"),
  priority: z.enum(["Low", "Medium", "High"]).optional().default("Low"),
});

export const updateReminderSchema = reminderSchema.partial();

export type ReminderSchemaInput = z.infer<typeof reminderSchema>;
