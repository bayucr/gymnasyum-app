"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, BellRing, CalendarDays } from "lucide-react";
import { CustomerWithPriority } from "@/features/customers/services/customer.service";
import { BookingWithSchedule } from "@/features/bookings/repositories/booking.repository";
import { generateWAMessage } from "../utils";
import {
  reminderSchema,
  ReminderSchemaInput,
} from "../schemas/reminder.schema";

interface CreateReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerWithPriority | null;
  customerBookings: BookingWithSchedule[];
  onSubmit: (data: ReminderSchemaInput) => Promise<void>;
}

export function CreateReminderDialog({
  isOpen,
  onClose,
  customer,
  customerBookings,
  onSubmit,
}: CreateReminderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReminderSchemaInput>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      customer_id: "",
      schedule_id: "",
      draft_message: "",
      status: "Scheduled",
      priority: "Low",
    },
  });

  const selectedScheduleId = useWatch({
    control: form.control,
    name: "schedule_id",
  });

  useEffect(() => {
    if (isOpen && customer) {
      form.reset({
        customer_id: customer.id,
        schedule_id: "",
        draft_message: "",
        status: "Scheduled",
        priority: customer.priorityLevel || "Low",
      });
    }
  }, [isOpen, customer, form]);

  useEffect(() => {
    if (customer && selectedScheduleId) {
      const booking = customerBookings.find(
        (b) => b.schedule_id === selectedScheduleId,
      );
      if (booking && booking.schedules) {
        const autoMsg = generateWAMessage(
          customer.name,
          booking.schedules.class_name,
          booking.schedules.datetime,
        );
        form.setValue("draft_message", autoMsg);
      }
    }
  }, [selectedScheduleId, customer, customerBookings, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: ReminderSchemaInput) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasNoClasses = customerBookings.length === 0;
  const selectedBooking = customerBookings.find(
    (b) => b.schedule_id === selectedScheduleId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <BellRing className="h-5 w-5 text-emerald-600" />
            Buat Pengingat Kelas
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-2"
        >
          {/* Field Nama Customer Locked */}
          <div className="space-y-1">
            <Label>Nama Customer</Label>
            <Input
              value={customer?.name || ""}
              disabled
              className="bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
            />
          </div>

          {/* Peringatan jika customer belum punya kelas */}
          {hasNoClasses ? (
            <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                Customer ini belum terdaftar di kelas manapun. Silakan daftarkan
                kelas terlebih dahulu sebelum membuat pengingat.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label>Pilih Kelas</Label>
                <Select
                  value={selectedScheduleId}
                  onValueChange={(val) => {
                    if (val) form.setValue("schedule_id", val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customerBookings.map((b) => (
                      <SelectItem key={b.id} value={b.schedule_id}>
                        {b.schedules.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.schedule_id && (
                  <p className="text-xs text-rose-500">
                    {form.formState.errors.schedule_id.message}
                  </p>
                )}
              </div>

              {/* Info Card Ringkas Detail Kelas Terpilih */}
              {selectedBooking?.schedules && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Detail Kelas Terpilih:</span>
                  </div>
                  <div className="text-emerald-800 pl-5">
                    <p className="font-medium">
                      {selectedBooking.schedules.class_name}
                    </p>
                    <p className="text-emerald-700">
                      {new Date(
                        selectedBooking.schedules.datetime,
                      ).toLocaleString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Textarea Draf Pesan Otomatis */}
          <div className="space-y-1">
            <Label htmlFor="draft_message">Draf Pesan WhatsApp</Label>
            <Textarea
              id="draft_message"
              rows={4}
              placeholder="Pesan akan terisi otomatis saat kelas dipilih..."
              disabled={hasNoClasses}
              {...form.register("draft_message")}
            />
            {form.formState.errors.draft_message && (
              <p className="text-xs text-rose-500">
                {form.formState.errors.draft_message.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || hasNoClasses || !selectedScheduleId}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Pengingat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
