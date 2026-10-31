"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, BellRing } from "lucide-react";
import { ReminderTable } from "@/features/reminders/components/reminder-table";
import {
  ReminderFormDialog,
  ReminderFormValues,
} from "@/features/reminders/components/reminder-form-dialog";
import { ReminderLog } from "@/types/database.types";
import { useReminders } from "@/features/reminders/hooks/use-reminders";

export default function RemindersPage() {
  const {
    reminders,
    loading,
    createReminder,
    updateReminder,
    deleteReminder,
    refetch,
  } = useReminders();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderLog | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedReminder(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (reminder: ReminderLog) => {
    setSelectedReminder(reminder);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus log pengingat ini?"))
      return;

    try {
      await deleteReminder(id);
      toast.success("Log pengingat berhasil dihapus");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus log";
      toast.error(msg);
    }
  };

  const handleSubmit = async (values: ReminderFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedReminder) {
        await updateReminder(selectedReminder.id, values);
        toast.success("Log pengingat berhasil diperbarui");
      } else {
        await createReminder(values);
        toast.success("Log pengingat baru berhasil dibuat");
      }
      setIsDialogOpen(false);
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
          onStatusChange={refetch}
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
