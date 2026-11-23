"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search, X, RotateCcw } from "lucide-react";
import { CustomerTable } from "@/features/customers/components/customer-table";
import {
  CustomerFormDialog,
  CustomerFormValues,
} from "@/features/customers/components/customer-form-dialog";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { CustomerWithPriority } from "@/features/customers/services/customer.service";
import { ErrorBanner } from "@/components/shared/error-banner";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { AssignClassDialog } from "@/features/bookings/components/assign-class-dialog";
import { CreateReminderDialog } from "@/features/reminders/components/create-reminder-dialog";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import { BookingWithSchedule } from "@/features/bookings/repositories/booking.repository";
import { ReminderSchemaInput } from "@/features/reminders/schemas/reminder.schema";
import { useSchedules } from "@/features/schedules/hooks/use-schedules";
import { useReminders } from "@/features/reminders/hooks/use-reminders";
import { PriorityLevel, SegmentType } from "@/types/database.types";

const SEGMENT_OPTIONS: { label: string; value: SegmentType | "ALL" }[] = [
  { label: "Semua Segmen", value: "ALL" },
  { label: "Ibu-ibu", value: "Ibu-ibu" },
  { label: "Lansia", value: "Lansia" },
  { label: "Umum", value: "Umum" },
];

const PRIORITY_OPTIONS: { label: string; value: PriorityLevel | "ALL" }[] = [
  { label: "Semua Prioritas", value: "ALL" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

export default function CustomersPage() {
  // 1. Data Hooks
  const {
    customers,
    meta,
    loading,
    error,
    setPage,
    setLimit,
    search,
    setSearch,
    segment,
    setSegment,
    priority,
    setPriority,
    resetFilters,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers(10);

  const { schedules } = useSchedules();
  const { createReminder } = useReminders();
  const { getCustomerSchedules, createBooking } = useBookings();

  // 2. Consolidated UI State for Modals
  const [activeModal, setActiveModal] = useState<{
    type: "customer" | "assign" | "reminder" | null;
    customer: CustomerWithPriority | null;
  }>({ type: null, customer: null });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerBookings, setCustomerBookings] = useState<
    Record<string, BookingWithSchedule[]>
  >({});

  const hasActiveFilters =
    search.trim() !== "" || segment !== "ALL" || priority !== "ALL";

  // 3. Modal Open/Close Handlers
  const closeModal = () => setActiveModal({ type: null, customer: null });

  const handleOpenCreate = () =>
    setActiveModal({ type: "customer", customer: null });

  const handleOpenEdit = (customer: CustomerWithPriority) =>
    setActiveModal({ type: "customer", customer });

  const handleOpenAssign = (customer: CustomerWithPriority) =>
    setActiveModal({ type: "assign", customer });

  const handleOpenReminder = async (customer: CustomerWithPriority) => {
    setActiveModal({ type: "reminder", customer });
    if (!customerBookings[customer.id]) {
      await handleFetchCustomerBookings(customer.id);
    }
  };

  // 4. CRUD Customer Handlers
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) return;

    try {
      await deleteCustomer(id);
      toast.success("Data customer berhasil dihapus");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus customer";
      toast.error(message);
    }
  };

  const handleSubmitCustomer = async (values: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      if (activeModal.customer) {
        await updateCustomer(activeModal.customer.id, values);
        toast.success("Data customer berhasil diperbarui");
      } else {
        await createCustomer(values);
        toast.success("Customer baru berhasil ditambahkan");
      }
      closeModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan data";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Booking & Expandable Table Handlers
  const handleFetchCustomerBookings = async (customerId: string) => {
    const list = await getCustomerSchedules(customerId);
    if (list) {
      setCustomerBookings((prev) => ({ ...prev, [customerId]: list }));
    }
    return list;
  };

  const handleAssignSubmit = async (customerId: string, scheduleId: string) => {
    try {
      await createBooking(customerId, scheduleId);
      toast.success("Customer berhasil didaftarkan ke kelas");
      handleFetchCustomerBookings(customerId);
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mendaftar kelas";
      toast.error(msg);
    }
  };

  // 6. Reminder Submit Handler
  const handleReminderSubmit = async (data: ReminderSchemaInput) => {
    try {
      await createReminder(data);
      toast.success("Pengingat berhasil dibuat");
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Data Customer
          </h1>
          <p className="text-sm text-slate-500">
            Kelola data pelanggan, pantau rasio kehadiran, dan buat pengingat
            jadwal kelas.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Customer
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
              placeholder="Cari nama atau nomor WhatsApp..."
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
              value={segment}
              onChange={(e) =>
                setSegment(e.target.value as SegmentType | "ALL")
              }
              aria-label="Filter Segmen"
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-emerald-600 focus:outline-none"
            >
              {SEGMENT_OPTIONS.map((opt) => (
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
          title="Gagal Memuat Data Customer"
          message={error}
          onRetry={refetch}
        />
      )}

      {loading && customers.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          Memuat data customer...
        </div>
      ) : (
        <div className="space-y-4">
          <div className={loading ? "opacity-60 pointer-events-none" : ""}>
            <CustomerTable
              customers={customers}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onAssignClass={handleOpenAssign}
              onCreateReminder={handleOpenReminder}
              customerBookings={customerBookings}
              onFetchCustomerBookings={handleFetchCustomerBookings}
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

      <CustomerFormDialog
        isOpen={activeModal.type === "customer"}
        onClose={closeModal}
        onSubmit={handleSubmitCustomer}
        initialData={activeModal.customer}
        isSubmitting={isSubmitting}
      />

      <AssignClassDialog
        isOpen={activeModal.type === "assign"}
        onClose={closeModal}
        customer={activeModal.customer}
        schedules={schedules}
        onSubmit={handleAssignSubmit}
      />

      <CreateReminderDialog
        isOpen={activeModal.type === "reminder"}
        onClose={closeModal}
        customer={activeModal.customer}
        customerBookings={
          activeModal.customer
            ? customerBookings[activeModal.customer.id] || []
            : []
        }
        onSubmit={handleReminderSubmit}
      />
    </div>
  );
}
