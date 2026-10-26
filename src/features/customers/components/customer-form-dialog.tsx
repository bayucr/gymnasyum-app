"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Customer, SegmentType, CustomerStatus } from "@/types/database.types";

const customerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z
    .string()
    .min(10, "Nomor HP minimal 10 digit")
    .regex(/^62\d+$/, "Nomor HP harus diawali '62' (contoh: 628123456789)"),
  segment: z.enum(["Ibu-ibu", "Lansia", "Umum"] as const, {
    message: "Pilih segmen pelanggan",
  }),
  status: z.enum(["Active", "Inactive"] as const, {
    message: "Pilih status pelanggan",
  }),
  attendance_rate: z
    .number({ message: "Masukkan angka yang valid" })
    .min(0, "Minimal 0")
    .max(1, "Maksimal 1 (contoh: 0.85 untuk 85%)"),
  cancellation_count: z
    .number({ message: "Masukkan angka yang valid" })
    .min(0, "Minimal 0"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  initialData?: Customer | null;
  isSubmitting: boolean;
}

export function CustomerFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: CustomerFormDialogProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "62",
      segment: "Umum",
      status: "Active",
      attendance_rate: 1.0,
      cancellation_count: 0,
    },
  });

  // Gunakan useWatch agar aman bagi React Compiler
  const segmentValue = useWatch({
    control: form.control,
    name: "segment",
  });

  const statusValue = useWatch({
    control: form.control,
    name: "status",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        phone: initialData.phone,
        segment: initialData.segment,
        status: initialData.status,
        attendance_rate: initialData.attendance_rate,
        cancellation_count: initialData.cancellation_count,
      });
    } else {
      form.reset({
        name: "",
        phone: "62",
        segment: "Umum",
        status: "Active",
        attendance_rate: 1.0,
        cancellation_count: 0,
      });
    }
  }, [initialData, form, isOpen]);

  const handleSubmit = async (values: CustomerFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Customer" : "Tambah Customer Baru"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Siti Rahma"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-rose-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Nomor WA (Format 62...)</Label>
            <Input
              id="phone"
              placeholder="6281234567890"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-rose-500">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Segmen</Label>
              <Select
                value={segmentValue}
                onValueChange={(val) =>
                  form.setValue("segment", val as SegmentType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Segmen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ibu-ibu">Ibu-ibu</SelectItem>
                  <SelectItem value="Lansia">Lansia</SelectItem>
                  <SelectItem value="Umum">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={statusValue}
                onValueChange={(val) =>
                  form.setValue("status", val as CustomerStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="attendance_rate">Kehadiran (0.0 - 1.0)</Label>
              <Input
                id="attendance_rate"
                type="number"
                step="0.05"
                placeholder="0.85"
                {...form.register("attendance_rate", { valueAsNumber: true })}
              />
              {form.formState.errors.attendance_rate && (
                <p className="text-xs text-rose-500">
                  {form.formState.errors.attendance_rate.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cancellation_count">Jumlah Pembatalan</Label>
              <Input
                id="cancellation_count"
                type="number"
                placeholder="0"
                {...form.register("cancellation_count", {
                  valueAsNumber: true,
                })}
              />
              {form.formState.errors.cancellation_count && (
                <p className="text-xs text-rose-500">
                  {form.formState.errors.cancellation_count.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
