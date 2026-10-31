"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";
import { ScheduleTable } from "@/features/schedules/components/schedule-table";
import {
  ScheduleFormDialog,
  ScheduleFormValues,
} from "@/features/schedules/components/schedule-form-dialog";
import { Schedule } from "@/types/database.types";
import { toast } from "sonner";
import { useSchedules } from "@/features/schedules/hooks/use-schedules";

export default function SchedulesPage() {
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule } =
    useSchedules();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedSchedule(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal kelas ini?")) return;

    try {
      await deleteSchedule(id);
      toast.success("Jadwal kelas berhasil dihapus");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus jadwal";
      toast.error(msg);
    }
  };

  const handleSubmit = async (values: ScheduleFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.id, values);
        toast.success("Jadwal kelas berhasil diperbarui");
      } else {
        await createSchedule(values);
        toast.success("Jadwal kelas baru berhasil ditambahkan");
      }
      setIsDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan jadwal";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-600" />
            Jadwal Kelas Gym
          </h1>
          <p className="text-sm text-slate-500">
            Atur dan kelola jadwal sesi olahraga, waktu pelaksanaan, serta kuota
            peserta.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          Memuat data jadwal kelas...
        </div>
      ) : (
        <ScheduleTable
          schedules={schedules}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <ScheduleFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedSchedule}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
