"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CustomerWithPriority } from "@/features/customers/services/customer.service";
import { Schedule } from "@/types/database.types";

interface AssignClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerWithPriority | null;
  schedules: Schedule[];
  onSubmit: (customerId: string, scheduleId: string) => Promise<void>;
}

export function AssignClassDialog({
  isOpen,
  onClose,
  customer,
  schedules,
  onSubmit,
}: AssignClassDialogProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setSelectedScheduleId("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !selectedScheduleId) return;

    try {
      setIsSubmitting(true);
      await onSubmit(customer.id, selectedScheduleId);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatScheduleDateTime = (datetimeStr: string) => {
    try {
      const date = new Date(datetimeStr);
      return date.toLocaleString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return datetimeStr;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Daftarkan Kelas - {customer?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Pilih Jadwal Kelas</Label>
            <Select
              value={selectedScheduleId}
              onValueChange={(val) => setSelectedScheduleId(val ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas...">
                  {selectedScheduleId
                    ? schedules.find((s) => s.id === selectedScheduleId)
                        ?.class_name
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {schedules.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.class_name} ({formatScheduleDateTime(s.datetime)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={isSubmitting || !selectedScheduleId}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Mendaftarkan..." : "Simpan Pendaftaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
