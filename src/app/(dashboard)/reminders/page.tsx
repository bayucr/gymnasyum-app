"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BellRing, Search, X, RotateCcw } from "lucide-react";
import { ReminderTable } from "@/features/reminders/components/reminder-table";
import {
  ReminderFormDialog,
  ReminderFormValues,
} from "@/features/reminders/components/reminder-form-dialog";
import { ErrorBanner } from "@/components/shared/error-banner";
import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  PriorityLevel,
  ReminderLog,
  ReminderStatus,
} from "@/types/database.types";
import { useReminders } from "@/features/reminders/hooks/use-reminders";

const STATUS_OPTIONS: { label: string; value: ReminderStatus | "ALL" }[] = [
  { label: "Semua Status", value: "ALL" },
  { label: "Scheduled", value: "Scheduled" },
  { label: "Sent", value: "Sent" },
  { label: "Responded", value: "Responded" },
  { label: "No Response", value: "No Response" },
];

const PRIORITY_OPTIONS: { label: string; value: PriorityLevel | "ALL" }[] = [
  { label: "Semua Prioritas", value: "ALL" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

export default function RemindersPage() {
  const {
    reminders,
    meta,
    loading,
    error,
    setPage,
    setLimit,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    resetFilters,
    createReminder,
    updateReminder,
    deleteReminder,
    refetch,
  } = useReminders(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderLog | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasActiveFilters =
    search.trim() !== "" || status !== "ALL" || priority !== "ALL";

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="bg-emerald-600 hover:bg-emerald-700 gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Buat Log Pengingat
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Input Pencarian */}
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, nomor WA, atau kelas..."
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as ReminderStatus | "ALL")
              }
              aria-label="Filter Status Pengingat"
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as PriorityLevel | "ALL")
              }
              aria-label="Filter Prioritas"
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-9 gap-1.5 text-slate-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <ErrorBanner
          title="Gagal Memuat Log Pengingat"
          message={error}
          onRetry={refetch}
        />
      )}

      {loading && reminders.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          Memuat data log pengingat...
        </div>
      ) : (
        <div className="space-y-4">
          <div className={loading ? "opacity-60 pointer-events-none" : ""}>
            <ReminderTable
              reminders={reminders}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onStatusChange={refetch}
            />
          </div>

          <div className="bg-white px-4 pb-4 rounded-lg border border-slate-200">
            <PaginationControls
              meta={meta}
              onPageChange={setPage}
              onLimitChange={setLimit}
              disabled={loading}
            />
          </div>
        </div>
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
