"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";
import { ScheduleTable } from "@/features/schedules/components/schedule-table";
import {
  ScheduleFormDialog,
  ScheduleFormValues,
} from "@/features/schedules/components/schedule-form-dialog";
import { Schedule } from "@/types/database.types";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      const json = await res.json();
      if (json.data) {
        setSchedules(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data jadwal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const init = async () => {
      try {
        const res = await fetch("/api/schedules");
        const json = await res.json();
        if (isSubscribed && json.data) {
          setSchedules(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data jadwal:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isSubscribed = false;
    };
  }, []);

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
      setLoading(true);
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSchedules();
      } else {
        const json = await res.json();
        alert(`Gagal menghapus: ${json.error || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error("Gagal menghapus jadwal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ScheduleFormValues) => {
    try {
      setIsSubmitting(true);
      const url = selectedSchedule
        ? `/api/schedules/${selectedSchedule.id}`
        : "/api/schedules";
      const method = selectedSchedule ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(`Gagal menyimpan: ${json.error || "Terjadi kesalahan server"}`);
        return;
      }

      setIsDialogOpen(false);
      setLoading(true);
      await fetchSchedules();
    } catch (err) {
      console.error("Gagal menyimpan jadwal:", err);
      alert("Gagal terhubung ke server.");
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
