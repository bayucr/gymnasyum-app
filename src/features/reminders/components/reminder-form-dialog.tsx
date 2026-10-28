"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, CalendarDays } from "lucide-react";
import {
  Customer,
  Schedule,
  ReminderStatus,
  PriorityLevel,
} from "@/types/database.types";

const reminderSchema = z.object({
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

export type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReminderFormValues) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any | null;
  isSubmitting: boolean;
}

export function ReminderFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: ReminderFormDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      customer_id: "",
      schedule_id: "",
      draft_message: "",
      status: "Scheduled",
      priority: "Low",
    },
  });

  const statusValue = useWatch({
    control: form.control,
    name: "status",
  });

  const priorityValue = useWatch({
    control: form.control,
    name: "priority",
  });

  const customerIdValue = useWatch({
    control: form.control,
    name: "customer_id",
  });

  const scheduleIdValue = useWatch({
    control: form.control,
    name: "schedule_id",
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch("/api/customers").then((res) => res.json()),
        fetch("/api/schedules").then((res) => res.json()),
      ])
        .then(([custData, schedData]) => {
          if (custData.data) setCustomers(custData.data);
          if (schedData.data) setSchedules(schedData.data);
        })
        .catch((err) => console.error("Gagal memuat relasi data:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        customer_id: initialData.customer_id,
        schedule_id: initialData.schedule_id,
        draft_message: initialData.draft_message || "",
        status: initialData.status || "Scheduled",
        priority: initialData.priority || "Low",
      });
    } else {
      form.reset({
        customer_id: "",
        schedule_id: "",
        draft_message: "",
        status: "Scheduled",
        priority: "Low",
      });
    }
  }, [initialData, form, isOpen]);

  const handleSubmit = async (values: ReminderFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  const selectedCustomer = customers.find((c) => c.id === customerIdValue);
  const selectedSchedule = schedules.find((s) => s.id === scheduleIdValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Log Pengingat" : "Buat Log Pengingat Baru"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Customer</Label>
              <Select
                value={customerIdValue}
                onValueChange={(val) => {
                  if (val) form.setValue("customer_id", val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Customer">
                    {selectedCustomer?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.customer_id && (
                <p className="text-xs text-rose-500">
                  {form.formState.errors.customer_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Jadwal Kelas</Label>
              <Select
                value={scheduleIdValue}
                onValueChange={(val) => {
                  if (val) form.setValue("schedule_id", val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jadwal">
                    {selectedSchedule?.class_name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.class_name}
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
          </div>

          {/* Info Card Terpilih untuk Form Log Pengingat */}
          {(selectedCustomer || selectedSchedule) && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs space-y-1 text-slate-700">
              {selectedCustomer && (
                <div className="flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    Customer: <strong>{selectedCustomer.name}</strong> (
                    {selectedCustomer.phone})
                  </span>
                </div>
              )}
              {selectedSchedule && (
                <div className="flex items-center gap-1.5 font-medium">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    Kelas: <strong>{selectedSchedule.class_name}</strong> -{" "}
                    {new Date(selectedSchedule.datetime).toLocaleString(
                      "id-ID",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}{" "}
                    WIB
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="draft_message">Draf Pesan WhatsApp</Label>
            <Textarea
              id="draft_message"
              rows={3}
              placeholder="Halo Kak, mengingatkan kelas Zumba besok jam 09:00 WIB..."
              {...form.register("draft_message")}
            />
            {form.formState.errors.draft_message && (
              <p className="text-xs text-rose-500">
                {form.formState.errors.draft_message.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Status Pengingat</Label>
              <Select
                value={statusValue}
                onValueChange={(val) => {
                  if (val) {
                    form.setValue("status", val as ReminderStatus);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Responded">Responded</SelectItem>
                  <SelectItem value="No Response">No Response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Prioritas</Label>
              <Select
                value={priorityValue}
                onValueChange={(val) => {
                  if (val) {
                    form.setValue("priority", val as PriorityLevel);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
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
              {isSubmitting ? "Menyimpan..." : "Simpan Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
