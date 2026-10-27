import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().min(8, "Nomor HP minimal 8 karakter"),
  segment: z.enum(["Ibu-ibu", "Lansia", "Umum"], {
    message: "Segment harus salah satu dari: Ibu-ibu, Lansia, atau Umum",
  }),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  attendance_rate: z.number().min(0).max(1).default(1.0),
  cancellation_count: z.number().min(0).default(0),
});

export const updateCustomerSchema = customerSchema.partial();

// Tipe output terurai bersih tanpa undefined pada default fields
export type CustomerSchemaInput = z.infer<typeof customerSchema>;
