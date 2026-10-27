import { z } from "zod";

export const scheduleSchema = z.object({
  class_name: z.string().min(2, "Nama kelas minimal 2 karakter"),
  datetime: z.string().min(1, "Pilih tanggal dan waktu kelas"),
  quota: z.number().min(1, "Kuota minimal 1 orang").optional().default(10),
});

export const updateScheduleSchema = scheduleSchema.partial();

export type ScheduleSchemaInput = z.infer<typeof scheduleSchema>;
