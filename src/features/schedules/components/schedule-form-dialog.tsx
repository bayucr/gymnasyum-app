"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Schedule } from "@/types/database.types";

const scheduleSchema = z.object({
  class_name: z.string().min(2, "Nama kelas minimal 2 karakter"),
  datetime: z.string().min(1, "Pilih tanggal dan waktu kelas"),
  quota: z
    .number({ message: "Masukkan kuota yang valid" })
    .min(1, "Kuota minimal 1 orang"),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormValues) => Promise<void>;
  initialData?: Schedule | null;
  isSubmitting: boolean;
}

export function ScheduleFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: ScheduleFormDialogProps) {
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      class_name: "",
      datetime: "",
      quota: 10,
    },
  });

  useEffect(() => {
    if (initialData) {
      // Format ISO string ke format yang diterima input datetime-local (YYYY-MM-DDThh:mm)
      const formattedDate = initialData.datetime
        ? new Date(initialData.datetime).toISOString().slice(0, 16)
        : "";

      form.reset({
        class_name: initialData.class_name,
        datetime: formattedDate,
        quota: initialData.quota,
      });
    } else {
      form.reset({
        class_name: "",
        datetime: "",
        quota: 10,
      });
    }
  }, [initialData, form, isOpen]);

  const handleSubmit = async (values: ScheduleFormValues) => {
    // Convert nilai datetime dari input lokal ke format ISO string UTC untuk Supabase
    const isoDatetime = new Date(values.datetime).toISOString();
    await onSubmit({ ...values, datetime: isoDatetime });
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Jadwal Kelas" : "Tambah Jadwal Kelas Baru"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1">
            <Label htmlFor="class_name">Nama Kelas</Label>
            <Input
              id="class_name"
              placeholder="Yoga Pagi, Zumba, High Intensity, dll"
              {...form.register("class_name")}
            />
            {form.formState.errors.class_name && (
              <p className="text-xs text-rose-500">
                {form.formState.errors.class_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="datetime">Tanggal & Waktu Kelas</Label>
            <Input
              id="datetime"
              type="datetime-local"
              {...form.register("datetime")}
            />
            {form.formState.errors.datetime && (
              <p className="text-xs text-rose-500">
                {form.formState.errors.datetime.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="quota">Kuota Peserta</Label>
            <Input
              id="quota"
              type="number"
              placeholder="15"
              {...form.register("quota", { valueAsNumber: true })}
            />
            {form.formState.errors.quota && (
              <p className="text-xs text-rose-500">
                {form.formState.errors.quota.message}
              </p>
            )}
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
