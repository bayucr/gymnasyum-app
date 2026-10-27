import { z } from "zod";

/**
 * Helper terpusat untuk menormalisasi nomor HP ke format standar 62...
 * Contoh: "081234567890" -> "6281234567890", "+6281234567890" -> "6281234567890"
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    return "62" + cleaned.slice(1);
  }
  return cleaned;
}

export const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z
    .string()
    .min(8, "Nomor HP minimal 8 karakter")
    .refine(
      (val) => /^(\+?62|08)[0-9]{7,12}$/.test(val.replace(/\s+/g, "")),
      "Format nomor HP tidak valid (harus diawali 08 atau 62, contoh: 081234567890)",
    ),
  segment: z.enum(["Ibu-ibu", "Lansia", "Umum"], {
    message: "Segment harus salah satu dari: Ibu-ibu, Lansia, atau Umum",
  }),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  attendance_rate: z.number().min(0).max(1).default(1.0),
  cancellation_count: z.number().min(0).default(0),
});

export const updateCustomerSchema = customerSchema.partial();

export type CustomerSchemaInput = z.infer<typeof customerSchema>;
