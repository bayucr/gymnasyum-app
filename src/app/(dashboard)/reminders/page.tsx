"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, BellRing } from "lucide-react";
import { ReminderTable } from "@/features/reminders/components/reminder-table";
import {
  ReminderFormDialog,
  ReminderFormValues,
} from "@/features/reminders/components/reminder-form-dialog";

export default function RemindersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedReminder, setSelectedReminder] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refetch manual untuk aksi setelah mutasi (create/edit/delete)
  const refetchReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Gagal mengambil data pengingat");
      setReminders(json.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect untuk inisialisasi awal saat komponen di-mount
  useEffect(() => {
    let ignore = false;

    async function initData() {
      try {
        const res = await fetch("/api/reminders");
        const json = await res.json();
        if (!ignore) {
          if (!res.ok)
            throw new Error(json.error || "Gagal mengambil data pengingat");
          setReminders(json.data || []);
        }
      } catch (err) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
          toast.error(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    initData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenCreate = () => {
    setSelectedReminder(null);
    setIsDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEdit = (reminder: any) => {
    setSelectedReminder(reminder);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus log pengingat ini?"))
      return;

    try {
      setLoading(true);
      const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menghapus log pengingat");
      }

      toast.success("Log pengingat berhasil dihapus");
      await refetchReminders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus log";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ReminderFormValues) => {
    try {
      setIsSubmitting(true);
      const url = selectedReminder
        ? `/api/reminders/${selectedReminder.id}`
        : "/api/reminders";
      const method = selectedReminder ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Terjadi kesalahan server");
      }

      toast.success(
        selectedReminder
          ? "Log pengingat berhasil diperbarui"
          : "Log pengingat baru berhasil dibuat",
      );
      setIsDialogOpen(false);
      await refetchReminders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan log";
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
            <BellRing className="h-6 w-6 text-emerald-600" />
            Log Pengingat WhatsApp
          </h1>
          <p className="text-sm text-slate-500">
            Kelola draf pesan pengingat, kirim langsung via WhatsApp Web, dan
            lacak status respon pelanggan.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" />
          Buat Log Pengingat
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          Memuat data log pengingat...
        </div>
      ) : (
        <ReminderTable
          reminders={reminders}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <ReminderFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedReminder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
