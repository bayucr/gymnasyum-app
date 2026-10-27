"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  customerSchema,
  CustomerSchemaInput,
} from "@/features/customers/schemas/customer.schema";
import { CustomerWithPriority } from "../services/customer.service";

export type CustomerFormValues = CustomerSchemaInput;

interface CustomerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  initialData?: CustomerWithPriority | null;
  isSubmitting: boolean;
}

export function CustomerFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: CustomerFormDialogProps) {
  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      segment: "Umum" as const,
      status: "Active" as const,
      attendance_rate: 1.0,
      cancellation_count: 0,
    },
  });

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
        name: initialData.name || "",
        phone: initialData.phone || "",
        segment: initialData.segment || "Umum",
        status: initialData.status || "Active",
        attendance_rate: initialData.attendance_rate ?? 1.0,
        cancellation_count: initialData.cancellation_count ?? 0,
      });
    } else {
      form.reset({
        name: "",
        phone: "",
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
            {initialData ? "Edit Data Customer" : "Tambah Customer Baru"}
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
              placeholder="Contoh: Budi Santoso"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-rose-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Nomor WhatsApp / HP</Label>
            <Input
              id="phone"
              placeholder="Contoh: 081234567890"
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
              <Label>Kategori Segment</Label>
              <Select
                value={segmentValue}
                onValueChange={(val) => {
                  if (val) {
                    form.setValue(
                      "segment",
                      val as "Ibu-ibu" | "Lansia" | "Umum",
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Umum">Umum</SelectItem>
                  <SelectItem value="Ibu-ibu">Ibu-ibu</SelectItem>
                  <SelectItem value="Lansia">Lansia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={statusValue}
                onValueChange={(val) => {
                  if (val) {
                    form.setValue("status", val as "Active" | "Inactive");
                  }
                }}
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

          {/* Field khusus override riwayat, hanya tampil pada mode Edit */}
          {initialData && (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="attendance_rate_pct">Kehadiran (%)</Label>
                <Input
                  id="attendance_rate_pct"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="100"
                  value={Math.round((form.watch("attendance_rate") ?? 1) * 100)}
                  onChange={(e) => {
                    const pct = parseFloat(e.target.value) || 0;
                    const clamped = Math.min(100, Math.max(0, pct));
                    form.setValue("attendance_rate", clamped / 100);
                  }}
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
                  min={0}
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
          )}

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
              {isSubmitting ? "Menyimpan..." : "Simpan Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
