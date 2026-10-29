import { z } from "zod";

export const createBookingSchema = z.object({
  customer_id: z.string().min(1, "Customer ID wajib diisi"),
  schedule_id: z.string().min(1, "Schedule ID wajib diisi"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
