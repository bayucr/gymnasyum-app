"use client";

import { useEffect, useState } from "react";
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

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      const json = await res.json();
      if (json.data) {
        setReminders(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil log pengingat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const init = async () => {
      try {
        const res = await fetch("/api/reminders");
        const json = await res.json();
        if (isSubscribed && json.data) {
          setReminders(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil log pengingat:", err);
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
      if (res.ok) {
        await fetchReminders();
      } else {
        const json = await res.json();
        alert(`Gagal menghapus: ${json.error || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error("Gagal menghapus log:", err);
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
        alert(`Gagal menyimpan: ${json.error || "Terjadi kesalahan server"}`);
        return;
      }

      setIsDialogOpen(false);
      setLoading(true);
      await fetchReminders();
    } catch (err) {
      console.error("Gagal menyimpan log:", err);
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
